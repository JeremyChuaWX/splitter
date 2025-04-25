"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TableCell, TableRow } from "@/components/ui/table";

export function ItemRows({ groupId }: { groupId: string }) {
    const trpc = useTRPC();
    const { data: items } = useSuspenseQuery(
        trpc.getItems.queryOptions({ groupId: groupId }),
    );

    return (
        <>
            {items.map((item) => (
                <ItemRow key={item.id} item={item} />
            ))}
        </>
    );
}

function ItemRow({
    item,
}: {
    item: { id: string; name: string; amount: bigint; data: unknown };
}) {
    return (
        <TableRow>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>Alice, Bob, Charlie</TableCell>
            <TableCell>Alice, Bob, Charlie</TableCell>
            <TableCell className="text-right">${item.amount}</TableCell>
        </TableRow>
    );
}
