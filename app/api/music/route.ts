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

        const response = await replicate.run(
            "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
            {
              input: {
                prompt_a: prompt,
              }
            }
          );

        await incrementApiLimit();

        // 応答の最初のメッセージを返す
        return NextResponse.json(response);

    } catch (error) {
        console.log("[Music] Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}