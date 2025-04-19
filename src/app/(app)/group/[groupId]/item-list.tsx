"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function ItemList() {
    const { groupId } = useParams();
    const trpc = useTRPC();
    const { data: items } = useSuspenseQuery(
        trpc.item.getForGroup.queryOptions({ groupId: groupId as string }),
    );

    return (
        <>
            <div>item 1</div>
            <div>item 2</div>
            <div>item 3</div>
        </>
    );
}
