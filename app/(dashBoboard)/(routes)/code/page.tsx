"use client"
import  axios  from "axios"
import { Heading } from "@/components/Heading"
import { Code } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { formSchema } from "./constants"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChatCompletionRequestMessage } from "openai"
import { Empty } from "@/components/Empty"
import { cn } from "@/lib/utils"
import UserAvatar from "@/components/User-avatar"
import { BotAvatar } from "@/components/Bot-avatar"
import { Loader } from "@/components/Loader"
import ReactMarkdown from "react-markdown";
import { useProModal } from "@/hooks/use-pro-modal"


const CodePage = () => {
  const proModal = useProModal();
  const router = useRouter(); 
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
        }
    })

    const isLoading = form.formState.isSubmitting;

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    try {
        // ユーザーメッセージを作成
        const userMessage: ChatCompletionRequestMessage = {
            role: "user",
            content: value.prompt,
        }

        // メッセージを追加
        const newMessages = [...messages, userMessage]

        // APIにメッセージを送信してレスポンスを取得
        const response = await axios.post("/api/code", {
            messages: newMessages
        })

        // メッセージとレスポンスを更新
        setMessages((current) => [...current, userMessage, response.data])

        // フォームをリセット
        form.reset()
    } catch (error: any) {
        if(error?.response?.status === 403) {
            proModal.onOpen();
        }
        console.log(error);
    } finally {
        // ページをリフレッシュ
        router.refresh();
    }
}

  return (
    <div>
        <Heading
            title="Code Generation"
            description="Enter a prompt to generate code."
            icon={ Code }
            iconColor="text-green-700"
            bgColor="bg-green-700/10"
        />
        <div className="px-4 lg:px-8">
            <div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="
                        rounded-lg 
                        border 
                        w-full 
                        p-4 
                        px-3 
                        md:px-6 
                        focus-within:shadow-sm
                        grid
                        grid-cols-12
                        gap-2
                      "
                    >
                        <FormField
                            name="prompt"
                            render={({ field }) => (
                                <FormItem className="col-span-12 lg:col-span-10">
                                    <FormControl className="m-0 p-0">
                                        <Input
                                            className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                            disabled={isLoading}
                                            placeholder="Simple toggle button using react hooks"
                                            {...field}
                                        />
                                    </FormControl>   
                                </FormItem>
                            )} 
                        />
                        <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                            Generate
                        </Button>
                    </form>
                </Form>   
            </div>
            <div className="space-y-4 mt-4">
                {isLoading && (
                    <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                        <Loader />
                    </div>
                )}
                {messages.length === 0 && !isLoading && (
                   <Empty label="No messages" />
                )}
               <div className="flex flex-col-reverse gap-y-4">
                    {messages.map((message) => (
                        <div 
                            key={message.content}
                            className={cn(
                                "p-8 w-full flex items-start gap-x-8 rounded-lg",
                                message.role === "user" ? "bg-white border border-black/10" : "bg-muted",
                            )}
                        >
                            {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                            <ReactMarkdown
                                components={{
                                pre: ({ node, ...props }) => (
                                    <div className="overflow-auto w-full my-2 bg-black text-green-500 p-2 rounded-lg">
                                    <pre {...props} />
                                    </div>
                                ),
                                code: ({ node, ...props }) => (
                                    <code className="bg-black/10 rounded-lg p-1" {...props} />
                                )
                                }} className="text-sm overflow-hidden leading-7"
                            >
                                {message.content || ""}
                            </ReactMarkdown>
                        </div>
                    ))}
               </div>
            </div>
        </div>
    </div>
)
}

export default CodePage