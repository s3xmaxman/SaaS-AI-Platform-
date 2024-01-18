import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

// この関数はHTTP GETリクエストを処理するためのものです。
export async function GET() {
  try { 
    const { userId } = auth(); // ユーザーの認証をチェックします。
    const user = await currentUser(); // 現在のユーザー情報を取得します。

    // ユーザーIDまたはユーザー情報が取得できない場合は、401 Unauthorizedレスポンスを返します。
    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // データベースからユーザーのサブスクリプション情報を検索します。
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId
      }
    });

    // ユーザーがStripeの顧客IDを持っている場合、Stripeの請求ポータルセッションを作成します。
    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl, // ユーザーが操作を終えた後にリダイレクトされるURLです。
      });

      // 作成されたセッションURLをJSON形式でレスポンスとして返します。
      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    }

    // それ以外の場合は、新しいチェックアウトセッションをStripeで作成します。
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl, // 支払い成功時にリダイレクトされるURLです。
      cancel_url: settingsUrl, // 支払いキャンセル時にリダイレクトされるURLです。
      payment_method_types: ["card"], // 使用可能な支払い方法です。
      mode: "subscription", // 支払いモードをサブスクリプションとして指定します。
      billing_address_collection: "auto", // 請求先住所の収集を自動にします。
      customer_email: user.emailAddresses[0].emailAddress, // ユーザーのメールアドレスです。
      line_items: [{
        // 購入される商品の情報です。
        price_data: {
          currency: "USD",
          product_data: {
            name: "BadAI Pro",
            description: "Unlimited AI Generations"
          },
          unit_amount: 2000, // 単価は2000セント(＝20ドル)です。
          recurring: {
            interval: "month" // 請求は毎月行われます。
          }
        },
        quantity: 1, // 商品の数量です。
      }],
      metadata: {
        userId, // ユーザーIDをメタデータとして保存します。
      },
    });

    // 新規作成されたセッションのURLをJSON形式でレスポンスとして返します。
    return new NextResponse(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    // 何か問題が発生した場合は、コンソールにエラーを出力し、
    // 500 Internal Errorのレスポンスを返します。
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
