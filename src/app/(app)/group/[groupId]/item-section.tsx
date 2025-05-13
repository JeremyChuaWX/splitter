"use client";

import { AddItemButton } from "./add-item-button";
import { ResponsiveContainer } from "@/components/responsive-container";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableRow,
} from "@/components/ui/table";
import { bigintToCurrency, bigintToNumber, cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from "@tanstack/react-query";
import { LucideLoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Item = {
    id: string;
    name: string;
    amount: bigint;
    data: {
        name: string;
    };
};

export function ItemSection() {
    const [open, setOpen] = useState(false);
    const [item, setItem] = useState<Item>();
    const { groupId } = useParams<{ groupId: string }>();
    const trpc = useTRPC();
    const {
        data: { items, total },
    } = useSuspenseQuery(
        trpc.getItemsWithTotal.queryOptions({ groupId: groupId }),
    );

    function handleItemRowClick(item: Item) {
        setOpen(true);
        setItem(item);
    }

    return (
        <>
            <div className="flex flex-col gap-6">
                <h2 className="text-xl font-medium">Items</h2>
                <Table>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow
                                key={item.id}
                                onClick={() => handleItemRowClick(item)}
                                className="cursor-pointer"
                            >
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
            {item !== undefined && (
                <ResponsiveContainer
                    open={open}
                    onOpenChange={setOpen}
                    closeComponent={<Button variant="outline">Cancel</Button>}
                    title={item?.name ?? ""}
                    content={({ closeComponent }) => (
                        <EditItemForm
                            groupId={groupId}
                            item={item}
                            closeFunction={() => setOpen(false)}
                            closeComponent={closeComponent}
                        />
                    )}
                />
            )}
        </>
    );
}

export function ItemSectionSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-medium">Items</h2>
            <Table>
                <TableBody>
                    <ItemRowSkeleton />
                    <ItemRowSkeleton />
                    <ItemRowSkeleton />
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Skeleton className="h-5" />
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

const editItemFormSchema = z.object({
    name: z.string().nonempty(),
    amount: z.number().positive(),
});

export function EditItemForm({
    groupId,
    item,
    closeFunction,
    closeComponent,
}: {
    groupId: string;
    item: Item;
    closeFunction: () => void;
    closeComponent: React.ReactNode;
}) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const { mutateAsync: editItem, isPending } = useMutation(
        trpc.updateItems.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(
                    trpc.getItemsWithTotal.queryOptions({ groupId: groupId }),
                );
                toast.success("Item edited successfully");
                closeFunction();
            },
            onError: () => {
                toast.error("Error editing item");
            },
        }),
    );

    const form = useForm<z.infer<typeof editItemFormSchema>>({
        resolver: zodResolver(editItemFormSchema),
        defaultValues: {
            name: item.name,
            amount: bigintToNumber(item.amount),
        },
        reValidateMode: "onSubmit",
    });

    async function onSubmit(data: z.infer<typeof editItemFormSchema>) {
        await editItem({
            groupId: groupId,
            itemId: item.id,
            name: data.name,
            amount: data.amount,
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item Amount</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-2 justify-end pt-4 w-full">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="relative"
                    >
                        {isPending && (
                            <LucideLoaderCircle className="absolute inset-0 m-auto w-4 h-4 animate-spin" />
                        )}
                        <span className={cn(isPending ? "invisible" : "")}>
                            Edit Item
                        </span>
                    </Button>
                    {closeComponent}
                </div>
            </form>
        </Form>
    );
}
