"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export default function Greeting() {
    const trpc = useTRPC();
    const { data, isLoading } = useQuery(trpc.greeting.hello.queryOptions());

    if (isLoading) {
        return <div>loading...</div>;
    }

    return <div>{data?.greeting ?? ""}</div>;
}
