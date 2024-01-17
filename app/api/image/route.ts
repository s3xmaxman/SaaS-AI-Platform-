import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
const openai = new OpenAIApi(configuration);


export async function POST(req: Request) {
    try {
        // ユーザーの認証を確認
        const { userId } = auth();

        // リクエストのボディを取得
        const body = await req.json();
        const { prompt, amount = "1", resolution = "512x512" } = body;

        // ユーザーが認証されていない場合は、401 Unauthorizedを返す
        if (!userId) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        // OpenAI APIキーが見つからない場合は、500 Internal Server Errorを返す
        if (!configuration.apiKey) {
            return NextResponse.json("OpenAI API key not found", { status: 500 });
        }

        // メッセージが指定されていない場合は、400 Bad Requestを返す
        if (!prompt) {
            return NextResponse.json("Please enter a prompt", { status: 400 });
        }

        if(!amount){
            return NextResponse.json("Please enter an amount", { status: 400 });
        }

        if(!resolution){
            return NextResponse.json("Please enter a resolution", { status: 400 });
        }

        // OpenAIのChat Completion APIを使用して応答を生成
        const response = await openai.createImage({
            prompt,
            n: parseInt(amount, 10),
            size: resolution,
        });

        // 応答の最初のメッセージを返す
        return NextResponse.json(response.data.data);

    } catch (error) {
        console.log("[Image] Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}