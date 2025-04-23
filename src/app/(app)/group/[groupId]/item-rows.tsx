"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Item } from "@/db/schema";

export function ItemRows({ groupId }: { groupId: string }) {
    const trpc = useTRPC();
    const { data: items } = useSuspenseQuery(
        trpc.item.getForGroup.queryOptions({ groupId: groupId }),
    );

    return (
        <>
            {items.map((item) => (
                <ItemRow key={item.id} item={item} />
            ))}
        </>
    );
}

function ItemRow({ item }: { item: Item }) {
    return (
        <TableRow>
            <TableCell className="font-medium">{item.data.name}</TableCell>
            <TableCell>Alice, Bob, Charlie</TableCell>
            <TableCell>Alice, Bob, Charlie</TableCell>
            <TableCell className="text-right">${item.data.amount}</TableCell>
        </TableRow>
    );
}
