"use client";

import { AddMembersButton } from "./add-members-button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { bigintToCurrency, cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

function textColor(balance: bigint) {
    if (balance < 0n) {
        return "text-red-600 dark:text-red-400";
    } else if (balance === 0n) {
        return "";
    } else {
        return "text-emerald-600 dark:text-emerald-400";
    }
}

export function BalanceSection() {
    const { groupId } = useParams<{ groupId: string }>();
    const trpc = useTRPC();
    const { data: balances } = useSuspenseQuery(
        trpc.getBalances.queryOptions({ groupId: groupId }),
    );

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-medium">Balances</h2>
            <Table>
                <TableBody>
                    {balances.map((balance) => (
                        <TableRow key={balance.id}>
                            <TableCell className="font-medium">
                                {balance.username}
                            </TableCell>
                            <TableCell
                                className={cn(
                                    "text-right",
                                    textColor(balance.balance),
                                )}
                            >
                                ${bigintToCurrency(balance.balance)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableCaption>
                    <AddMembersButton />
                </TableCaption>
            </Table>
        </div>
    );
}
