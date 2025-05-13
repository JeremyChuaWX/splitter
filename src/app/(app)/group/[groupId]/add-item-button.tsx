"use client";

import { ResponsiveContainer } from "@/components/responsive-container";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
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
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, LucideLoaderCircle, LucidePlus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function AddItemButton() {
    const { groupId } = useParams<{ groupId: string }>();
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                className="flex gap-1 justify-center items-center w-full"
            >
                <LucidePlus size={16} />
                Add Item
            </Button>
            <ResponsiveContainer
                open={open}
                onOpenChange={setOpen}
                title="Add Item"
                closeComponent={<Button variant="outline">Cancel</Button>}
                content={({ closeComponent }) => (
                    <AddItemForm
                        groupId={groupId}
                        closeComponent={closeComponent}
                        closeFunction={() => setOpen(false)}
                    />
                )}
            />
        </>
    );
}

const addItemFormSchema = z.object({
    name: z.string().nonempty(),
    amount: z.number().positive(),
    payeeIds: z.array(z.string().nonempty()).min(1),
    payerIds: z.array(z.string().nonempty()).min(1),
});

type FormFieldName = "payeeIds" | "payerIds";

function AddItemForm({
    groupId,
    closeFunction,
    closeComponent,
}: {
    groupId: string;
    closeFunction: () => void;
    closeComponent: React.ReactNode;
}) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof addItemFormSchema>>({
        resolver: zodResolver(addItemFormSchema),
        defaultValues: {
            name: "",
            amount: 0,
            payeeIds: [],
            payerIds: [],
        },
        reValidateMode: "onSubmit",
    });

    const { mutateAsync: addItem, isPending } = useMutation(
        trpc.addItem.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(
                    trpc.getItemsWithTotal.queryFilter({ groupId: groupId }),
                );
                toast.success("Added item successfully");
                form.reset();
                closeFunction();
            },
            onError: async (error) => {
                toast.success("Error adding item");
                console.error(error);
            },
        }),
    );

    async function onSubmit(data: z.infer<typeof addItemFormSchema>) {
        await addItem({
            groupId: groupId,
            name: data.name,
            amount: data.amount,
            payeeIds: data.payeeIds,
            payerIds: data.payerIds,
        });
    }

    return (
        <FormProvider {...form}>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid gap-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
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
                                <FormLabel>Amount</FormLabel>
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

                    <div className="grid gap-4">
                        <MemberCombobox name="payeeIds" label="Payees To Add" />
                        <MemberCombobox name="payerIds" label="Payers To Add" />
                    </div>

                    <div className="flex gap-2 justify-end w-full">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="relative"
                        >
                            {isPending && (
                                <LucideLoaderCircle className="absolute inset-0 m-auto w-4 h-4 animate-spin" />
                            )}
                            <span
                                className={cn(
                                    isPending ? "opacity-0" : "opacity-100",
                                )}
                            >
                                Add Item
                            </span>
                        </Button>
                        {closeComponent}
                    </div>
                </form>
            </Form>
        </FormProvider>
    );
}

function MemberCombobox({
    name,
    label,
}: {
    name: FormFieldName;
    label: React.ReactNode;
}) {
    const trpc = useTRPC();
    const { groupId } = useParams<{ groupId: string }>();
    const form = useFormContext<z.infer<typeof addItemFormSchema>>();
    const { data: members, isLoading } = useQuery(
        trpc.getMembers.queryOptions({ groupId: groupId }),
    );
    function handleSelectMember(memberId: string) {
        const selectedUserIds = new Set(form.getValues(name));
        if (selectedUserIds.has(memberId)) {
            selectedUserIds.delete(memberId);
        } else {
            selectedUserIds.add(memberId);
        }
        form.setValue(
            name,
            Array.from(selectedUserIds.entries(), (entry) => entry[0]),
        );
    }

    if (isLoading) {
        return <Skeleton className="w-full h-28" />;
    }

    return (
        <FormField
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormMessage />
                    <Command>
                        <CommandInput
                            placeholder="Search member..."
                            className="h-9"
                        />
                        <CommandList>
                            <CommandEmpty>No member found.</CommandEmpty>
                            <CommandGroup>
                                {(members ?? []).map((member) => (
                                    <CommandItem
                                        key={member.id}
                                        value={member.id}
                                        onSelect={handleSelectMember}
                                    >
                                        {member.username}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                field.value.includes(member.id)
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </FormItem>
            )}
        />
    );
}
