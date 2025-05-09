"use client";

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
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { createGroupSchema } from "@/trpc/routers/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LucideLoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function CreateGroupButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <ResponsiveContainer
                open={open}
                onOpenChange={setOpen}
                title="Add Item"
                triggerComponent={
                    <Button variant="outline">Create Group</Button>
                }
                closeComponent={<Button variant="outline">Cancel</Button>}
                content={({ closeComponent }) => (
                    <CreateGroupForm
                        closeFunction={() => setOpen(false)}
                        closeComponent={closeComponent}
                    />
                )}
            />
        </>
    );
}

function CreateGroupForm({
    closeFunction,
    closeComponent,
}: {
    closeFunction: () => void;
    closeComponent: React.ReactNode;
}) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { mutateAsync: createGroup, isPending } = useMutation(
        trpc.createGroup.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(
                    trpc.getGroups.queryFilter(),
                );
                toast.success("Created group successfully");
                form.reset();
                closeFunction();
            },
            onError: async (error) => {
                toast.success("Error creating group");
                console.error(error);
            },
        }),
    );
    const form = useForm<z.infer<typeof createGroupSchema>>({
        resolver: zodResolver(createGroupSchema),
        defaultValues: {
            name: "",
        },
    });
    async function onSubmit(data: z.infer<typeof createGroupSchema>) {
        await createGroup(data);
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4 items-start"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Group Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-2 justify-end w-full">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="relative"
                    >
                        {isPending && (
                            <LucideLoaderCircle className="absolute top-1/2 left-1/2 animate-spin transform -translate-x-1/2 -translate-y-1/2" />
                        )}
                        <span className={cn(isPending ? "invisible" : "")}>
                            Create Group
                        </span>
                    </Button>
                    {closeComponent}
                </div>
            </form>
        </Form>
    );
}
