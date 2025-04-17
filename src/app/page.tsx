"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { UserButton } from "@clerk/nextjs";

export default function Page() {
    // const trpc = useTRPC();
    // const {} = useMutation();

    return (
        <div className="flex flex-col items-center p-6 h-svh">
            <Navbar />
            <div className="pt-48 w-2/3">
                <GroupTable />
            </div>
        </div>
    );
}

function Navbar() {
    return (
        <div className="flex gap-2 w-full">
            <h1 className="flex-1 w-full text-xl font-extrabold">Splitter</h1>
            <div className="flex items-center shrink-0">
                <UserButton />
            </div>
            <ThemeToggle />
        </div>
    );
}

function GroupTable() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell className="font-medium">INV001</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Credit Card</TableCell>
                    <TableCell className="text-right">$250.00</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}
