"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { addMembersSchema } from "@/trpc/routers/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LucideLoaderCircle, LucidePlus, LucideTrash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { type SettingsContentProps } from "./settings-dropdown";

export function AddMembersForm({
    groupId,
    closeFunction,
    closeComponent,
}: SettingsContentProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [username, setUsername] = useState("");

    const addMembersFormSchema = addMembersSchema.omit({
        groupId: true,
    });

    const form = useForm<z.infer<typeof addMembersFormSchema>>({
        resolver: zodResolver(addMembersFormSchema),
        defaultValues: {
            members: [],
        },
        mode: "onChange",
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "members",
    });

    const { mutateAsync: addMembers, isPending } = useMutation(
        trpc.addMembers.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.getMembers.queryKey({ groupId: groupId }),
                });
                toast.success("Members added successfully");
                form.reset();
                setUsername("");
                closeFunction();
            },
            onError: (error) => {
                toast.error("Error adding members");
                console.error(error);
            },
        }),
    );

    async function onSubmit(data: z.infer<typeof addMembersFormSchema>) {
        await addMembers({
            groupId: groupId,
            members: data.members,
        });
    }

    function handleAddMemberToList() {
        const existingUsernames = form
            .getValues("members")
            .map((m) => m.username.toLowerCase());
        if (existingUsernames.includes(username.toLowerCase())) {
            toast.error("Duplicate Username");
            return;
        }
        append({ username: username });
        setUsername("");
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <div className="flex gap-2 items-end">
                    <FormItem className="flex-1">
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddMemberToList();
                                    }
                                }}
                            />
                        </FormControl>
                    </FormItem>

                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={handleAddMemberToList}
                        aria-label="Add member to list"
                        disabled={!username}
                    >
                        <LucidePlus className="w-4 h-4" />
                    </Button>
                </div>

                <FormField
                    control={form.control}
                    name="members"
                    render={() => (
                        <FormItem>
                            {fields.length > 0 && (
                                <>
                                    <FormLabel>Members to Add</FormLabel>
                                    <Table>
                                        <TableBody>
                                            {fields.map((field, index) => (
                                                <TableRow key={field.id}>
                                                    <TableCell className="font-medium break-all">
                                                        {form.getValues(
                                                            `members.${index}.username`,
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                remove(index)
                                                            }
                                                            aria-label="Remove member"
                                                        >
                                                            <LucideTrash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                        </FormItem>
                    )}
                />

                <div className="flex gap-2 justify-end pt-4 w-full">
                    <Button
                        type="submit"
                        disabled={isPending || fields.length === 0}
                        className="relative"
                    >
                        {isPending && (
                            <LucideLoaderCircle className="absolute inset-0 m-auto w-4 h-4 animate-spin" />
                        )}
                        <span className={cn(isPending ? "invisible" : "")}>
                            Add {fields.length > 0 ? fields.length : ""} Member
                            {fields.length !== 1 ? "s" : ""}
                        </span>
                    </Button>
                    {closeComponent}
                </div>
            </form>
        </Form>
    );
}
