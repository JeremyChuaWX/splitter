"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function ItemsComponent() {
    const { groupId } = useParams();
    const trpc = useTRPC();
    const { data: items } = useSuspenseQuery(
        trpc.item.getForGroup.queryOptions({ groupId: groupId as string }),
    );

    return (
        <div className="w-full">
            <div className="flex justify-between w-full">
                <h2 className="text-xl font-medium">Items</h2>
                <Button variant="outline">Add Item</Button>
            </div>
        </div>
    );
}
