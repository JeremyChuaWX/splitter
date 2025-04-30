import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ItemRows } from "./item-rows";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableFooter,
    TableCaption,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "./header";
import { LucidePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    params: Promise<{ groupId: string }>;
};

export default async function Page({ params }: Props) {
    const { groupId } = await params;
    prefetch(trpc.getGroup.queryOptions({ groupId: groupId }));
    prefetch(trpc.getItems.queryOptions({ groupId: groupId }));
    prefetch(trpc.getMembers.queryOptions({ groupId: groupId }));

    return (
        <HydrateClient>
            <div className="flex flex-col gap-6 w-full pt-18">
                <Suspense fallback={<Skeleton className="w-full h-12" />}>
                    <Header />
                </Suspense>
                <div className="grid grid-cols-2 gap-6">
                    <ItemSection />
                    <BalanceSection />
                </div>
            </div>
        </HydrateClient>
    );
}

function ItemSection() {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-medium">Items</h2>
            <Table>
                <TableBody>
                    <Suspense
                        fallback={
                            <>
                                <ItemRowSkeleton />
                                <ItemRowSkeleton />
                                <ItemRowSkeleton />
                            </>
                        }
                    >
                        <ItemRows />
                    </Suspense>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell className="text-right" colSpan={2}>
                            $123.45
                        </TableCell>
                    </TableRow>
                </TableFooter>
                <TableCaption>
                    <Button
                        variant="outline"
                        className="flex gap-1 justify-center items-center w-full"
                    >
                        <LucidePlus size={16} />
                        Add Item
                    </Button>
                </TableCaption>
            </Table>
        </div>
    );
}

function ItemRowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <Skeleton className="h-5" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-5" />
            </TableCell>
        </TableRow>
    );
}

function BalanceSection() {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-medium">Balances</h2>
            <Table>
                <TableBody>
                    <Suspense
                        fallback={
                            <>
                                <ItemRowSkeleton />
                                <ItemRowSkeleton />
                                <ItemRowSkeleton />
                            </>
                        }
                    >
                        <ItemRows />
                    </Suspense>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell className="text-right" colSpan={2}>
                            $123.45
                        </TableCell>
                    </TableRow>
                </TableFooter>
                <TableCaption>
                    <Button
                        variant="outline"
                        className="flex gap-1 justify-center items-center w-full"
                    >
                        <LucidePlus size={16} />
                        Add Member
                    </Button>
                </TableCaption>
            </Table>
        </div>
    );
}
