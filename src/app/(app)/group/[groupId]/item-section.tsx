"use client";

import { AddItemButton } from "./add-item-button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableRow,
} from "@/components/ui/table";
import { bigintToCurrency } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function ItemSection() {
    const { groupId } = useParams<{ groupId: string }>();
    const trpc = useTRPC();
    const {
        data: { items, total },
    } = useSuspenseQuery(
        trpc.getItemsWithTotal.queryOptions({ groupId: groupId }),
    );

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-medium">Items</h2>
            <Table>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">
                                {item.name}
                            </TableCell>
                            <TableCell className="text-right">
                                ${bigintToCurrency(item.amount)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell className="text-right" colSpan={2}>
                            ${bigintToCurrency(total)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
                <TableCaption>
                    <AddItemButton />
                </TableCaption>
            </Table>
        </div>
    );
}
