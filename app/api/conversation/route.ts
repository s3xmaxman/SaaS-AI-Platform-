import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";


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
        const { messages } = body;

        // ユーザーが認証されていない場合は、401 Unauthorizedを返す
        if (!userId) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        // OpenAI APIキーが見つからない場合は、500 Internal Server Errorを返す
        if (!configuration.apiKey) {
            return NextResponse.json("OpenAI API key not found", { status: 500 });
        }

        // メッセージが指定されていない場合は、400 Bad Requestを返す
        if (!messages) {
            return NextResponse.json("Please enter a prompt", { status: 400 });
        }

        const freeTrial = await checkApiLimit();

        if (!freeTrial) {
            return NextResponse.json("Free trial limit expired.", { status: 403 });
        }

        // OpenAIのChat Completion APIを使用して応答を生成
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages
        });

        await incrementApiLimit();

        // 応答の最初のメッセージを返す
        return NextResponse.json(response.data.choices[0].message);

    } catch (error) {
        console.log("[Conversation] Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}