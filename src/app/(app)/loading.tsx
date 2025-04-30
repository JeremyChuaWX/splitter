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
        <div className="flex justify-center items-center">
            <Loader2
                size={24}
                className={cn(
                    "animate-spin transition-opacity duration-300 ease-in",
                    show ? "opacity-100" : "opacity-0",
                )}
            />
        </div>
    );
}
