import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"

// Stripeからのリクエストに対するPOST関数を非同期でエクスポートする
export async function POST(req: Request) {
    // リクエストのボディからテキストを取得する
    const body = await req.text();
    // ヘッダーからStripe-Signatureを取得する
    const signature = headers().get("Stripe-Signature") as string;
  
    let event: Stripe.Event;
  
    try {
      // StripeのWebhookイベントを検証し、生成する
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {
      // エラーが捕捉された場合、400ステータスとエラーメッセージをレスポンスとして返す
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }
  
    // チェックアウトセッションのオブジェクトデータを取得する
    const session = event.data.object as Stripe.Checkout.Session;
  
    // イベントタイプがcheckout.session.completedの場合の処理
    if (event.type === "checkout.session.completed") {
      // 関連するサブスクリプション情報を取得する
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
  
      // セッション内にuserIdのメタデータが含まれていない場合、400ステータスを返す
      if (!session?.metadata?.userId) {
        return new NextResponse("User id is required", { status: 400 });
      }
  
      // prismadbを用いてユーザーのサブスクリプション情報を作成する
      await prismadb.userSubscription.create({
        data: {
          userId: session?.metadata?.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
    }
  
    // イベントタイプがinvoice.payment_succeededの場合の処理
    if (event.type === "invoice.payment_succeeded") {
      // 関連するサブスクリプション情報を再取得する
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
  
      // prismadbを用いてそのユーザーのサブスクリプション情報を更新する
      await prismadb.userSubscription.update({
        where: {
          stripeSubscriptionId: subscription.id,
        },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
    }
  
    // 全ての処理が成功した場合、200ステータスをリターンする
    return new NextResponse(null, { status: 200 });
  };
  

