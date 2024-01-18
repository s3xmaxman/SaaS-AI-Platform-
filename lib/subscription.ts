// @clerk/nextjsからauthモジュールをインポートする
import { auth } from "@clerk/nextjs";

// prismadbインスタンスをインポートする
import prismadb from "./prismadb";

// 1日をミリ秒で定義する
const DAY_IN_MS = 86_400_000;

// ユーザーのサブスクリプションが有効かどうかを確認する非同期関数
export const checkSubscription = async () => {
    // authモジュールからuserIdを取得する
    const { userId } = auth();

    // userIdがない場合、falseを返す
    if(!userId) {
        return false;
    }

    // prismadbからユーザーのサブスクリプション情報を取得する
    const userSubscription = await prismadb.userSubscription.findUnique({
        where: {
            // ユーザーIDで絞り込む
            userId: userId
        },
        // 必要なサブスクリプション詳細のみを選択して取得する
        select: {
            stripeSubscriptionId: true,
            stripeCurrentPeriodEnd: true,
            stripeCustomerId: true,
            stripePriceId: true,
        }
    })

    // サブスクリプション情報が取得できなかった場合、falseを返す
    if(!userSubscription) {
        return false;
    }

    // サブスクリプションが有効 (stripePriceIdが存在し、現在期間の終わりが現在時刻+1日よりも後である) かどうかをチェックする
    const isValid = userSubscription.stripePriceId && 
                    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    // isValidが真偽値であればその値を、それ以外なら強制的にboolean値に変換して返す
    return !!isValid;
}
