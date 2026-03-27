import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ButtonLoadingIndicator({ loading, loaderSize, className }: { loading: boolean, loaderSize?: number, className?: string }) {
    if (loading) {
        return (
            !!loaderSize ?
                <Loader2 className={cn("animate-spin mr-2 my-auto ", className)} size={loaderSize} />
                :
                <Loader2 className={cn("animate-spin mr-2 my-auto ", className)} />
        );
    } else {
        return null;
    }
}