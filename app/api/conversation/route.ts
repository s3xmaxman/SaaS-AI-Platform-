import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const openai = new OpenAIApi(configuration);


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

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages
        })

        return NextResponse.json(response.data.choices[0].message);

    } catch (error) {
        console.log("[Conversation] Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 