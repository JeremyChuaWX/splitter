"use client";

import { type SettingsContentProps } from "./settings-dropdown";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { updateGroupSchema } from "@/trpc/routers/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from "@tanstack/react-query";
import { LucideLoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function EditGroupForm({
    groupId,
    closeFunction,
    closeComponent,
}: SettingsContentProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const { data: group } = useSuspenseQuery(
        trpc.getGroup.queryOptions({ groupId: groupId }),
    );

    const { mutateAsync: editGroup, isPending } = useMutation(
        trpc.updateGroup.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.getGroup.queryKey({ groupId: groupId }),
                });
                toast.success("Group edited successfully");
                closeFunction();
            },
            onError: () => {
                toast.error("Error editing group");
            },
        }),
    );

    const editGroupFormSchema = updateGroupSchema.omit({
        groupId: true,
    });

    const form = useForm<z.infer<typeof editGroupFormSchema>>({
        resolver: zodResolver(editGroupFormSchema),
        defaultValues: {
            name: group.name,
        },
    });

    async function onSubmit(data: z.infer<typeof editGroupFormSchema>) {
        await editGroup({
            groupId: groupId,
            name: data.name,
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
                            <FormLabel>Group Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
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
                            Edit Group
                        </span>
                    </Button>
                    {closeComponent}
                </div>
            </form>
        </Form>
    );
}
