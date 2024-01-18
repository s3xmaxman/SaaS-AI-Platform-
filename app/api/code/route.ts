import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
const openai = new OpenAIApi(configuration);

const instructionMessage: ChatCompletionRequestMessage = {
    role: "system",
    content: "you are a code generator. you must answer only in markdown code snippets. use code comments for explanation",
}


export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { messages } = body;

        if(!userId) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        if(!configuration.apiKey) {
            return NextResponse.json("OpenAI API key not found", { status: 500 });
        }

        if(!messages) {
            return NextResponse.json("Please enter a prompt", { status: 400 });
        }

        const freeTrial = await checkApiLimit();
        const subscription = await checkSubscription();

        if(!freeTrial && !subscription) {
            return NextResponse.json("Free trial limit expired.", { status: 403 });
        }

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [instructionMessage, ...messages]
        })

        if(!subscription) {
            await incrementApiLimit();
        }

        return NextResponse.json(response.data.choices[0].message);

    } catch (error) {
        console.log("[Code] Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 