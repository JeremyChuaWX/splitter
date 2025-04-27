"use client";

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
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from "@tanstack/react-query";
import { Check, LucideLoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { type SettingsContentProps } from "./settings-dropdown";

const addItemFormSchema = z.object({
    name: z.string().nonempty(),
    amount: z.number().nonnegative(),
    payeeIds: z.array(z.string().nonempty()).min(1),
    payerIds: z.array(z.string().nonempty()).min(1),
});

type FormFieldName = "payeeIds" | "payerIds";

export function AddItemForm({
    groupId,
    closeFunction,
    closeComponent,
}: SettingsContentProps) {
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
    });

    const { mutateAsync: addItem, isPending } = useMutation(
        trpc.addItem.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.getItems.queryKey({
                        groupId: groupId,
                    }),
                });
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
        console.log(data);
        // await addItem({
        //     groupId: groupId,
        //     name: data.name,
        //     amount: data.amount,
        //     payees: data.payees,
        //     payers: data.payers,
        // });
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
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        onChange={(e) =>
                                            field.onChange(+e.target.value)
                                        }
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
    const { data: members } = useSuspenseQuery(
        trpc.getMembers.queryOptions({
            groupId: groupId,
        }),
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

    return (
        <FormField
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <Command>
                        <CommandInput
                            placeholder="Search member..."
                            className="h-9"
                        />
                        <CommandList>
                            <CommandEmpty>No member found.</CommandEmpty>
                            <CommandGroup>
                                {members.map((member) => (
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
