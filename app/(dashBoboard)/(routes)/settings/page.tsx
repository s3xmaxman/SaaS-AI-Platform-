import { Settings } from "lucide-react";

import { Heading } from "@/components/Heading";
import { checkSubscription } from "@/lib/subscription";
import { SubscriptionButton } from "@/components/SubscriptionButton";

const SettingsPage = async () => {
    const subscription = await checkSubscription();

    return (
        <div>
            <Heading
                title="Settings"
                description="Manage account settings"
                icon={Settings}
                iconColor="text-gray-700"
                bgColor="bg-gray-700/10" 
            />
            <div className="px-4 lg:px-8 space-y-4">
                <div className="text-muted-foreground text-sm">
                    {subscription ? "You are currently on a Pro plan." : "You are currently on a free plan."}
                </div>
                <SubscriptionButton subscription={subscription}/>
            </div>
        </div>
    )
}

export default SettingsPage