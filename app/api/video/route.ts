import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Replicate from "replicate";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";


const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY!
})


export async function POST(req: Request) {
    try {
        // ユーザーの認証を確認
        const { userId } = auth();

        // リクエストのボディを取得
        const body = await req.json();
        const { prompt } = body;

        // ユーザーが認証されていない場合は、401 Unauthorizedを返す
        if (!userId) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        // メッセージが指定されていない場合は、400 Bad Requestを返す
        if (!prompt) {
            return NextResponse.json("Please enter a prompt", { status: 400 });
        }

        const freeTrial = await checkApiLimit();

        if (!freeTrial) {
            return NextResponse.json("Free trial limit expired.", { status: 403 });
        }

        const response  = await replicate.run(
            "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
            {
              input: {
                prompt: prompt,
              }
            }
          );

          await incrementApiLimit();

        // 応答の最初のメッセージを返す
        return NextResponse.json(response);

    } catch (error) {
        console.log("[video] Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}