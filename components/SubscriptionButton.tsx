"use client"

import { Zap } from "lucide-react"
import { Button } from "./ui/button"
import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

interface SubscriptionButtonProps {
    subscription: boolean
}

export const SubscriptionButton = ({ subscription = false }: SubscriptionButtonProps) => {
    const [loading, setLoading] = useState(false);
    
    
    const onClick = async() => {
        try {
            setLoading(true);
            const response = await axios.get("/api/stripe");

            window.location.href = response.data.url;
            
        } catch (error) {
           toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }


    return (
        <Button variant={ subscription ? "default" : "premium"} onClick={onClick}>
            {subscription ? "Manage Subscription" : "Upgrade"}
            {!subscription && <Zap className="w-4 h-4 ml-2 fill-white" />}
        </Button>
    )
}

