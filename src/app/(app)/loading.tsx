"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const DELAY = 300;

export default function Loading() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(true);
        }, DELAY);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={cn(
                "flex items-center justify-center transition-opacity duration-300 ease-in",
                show ? "opacity-100" : "opacity-0",
            )}
            role="status"
            aria-busy={show}
        >
            <div className="flex gap-2 items-center text-muted-foreground">
                <Loader2
                    size={24}
                    className="animate-spin"
                    aria-hidden="true"
                />
            </div>
        </div>
    );
}
