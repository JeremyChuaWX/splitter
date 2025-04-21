"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from "@/components/ui/table";

export function ItemTable({ groupId }: { groupId: string }) {
    const trpc = useTRPC();
    const { data: items } = useSuspenseQuery(
        trpc.item.getForGroup.queryOptions({ groupId: groupId }),
    );

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead>To Pay</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <ItemRow key={item.id} item={item} />
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableHead colSpan={3}>Total Amount</TableHead>
                    <TableCell className="text-right">$123.45</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    );
}

function ItemRow({ item }: { item: any }) {
    return (
        <TableRow>
            <TableCell className="font-medium">{item.data.name}</TableCell>
            <TableCell>Alice, Bob, Charlie</TableCell>
            <TableCell>Alice, Bob, Charlie</TableCell>
            <TableCell className="text-right">${item.data.amount}</TableCell>
        </TableRow>
    );
}
