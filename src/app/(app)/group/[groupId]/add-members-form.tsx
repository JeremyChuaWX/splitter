"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { type Role } from "@/db/schema";
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
    const [currentEmail, setCurrentEmail] = useState("");
    const [currentRole, setCurrentRole] = useState<Role>("user");

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
                await queryClient.invalidateQueries({});
                toast.success("Members added successfully");
                form.reset();
                setCurrentEmail("");
                setCurrentRole("user");
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

    const handleAddMemberToList = () => {
        const emailValidation = z.string().email().safeParse(currentEmail);
        if (!emailValidation.success) {
            toast.error("Invalid Email");
            return;
        }

        const existingEmails = form
            .getValues("members")
            .map((m) => m.email.toLowerCase());
        if (existingEmails.includes(currentEmail.toLowerCase())) {
            toast.error("Duplicate Email");
            return;
        }

        append({ email: currentEmail, role: currentRole });

        setCurrentEmail("");
        setCurrentRole("user");
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                <div className="grid grid-cols-1 gap-2 items-end sm:grid-cols-[1fr_auto_auto]">
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="new.member@example.com"
                                value={currentEmail}
                                onChange={(e) =>
                                    setCurrentEmail(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddMemberToList();
                                    }
                                }}
                            />
                        </FormControl>
                    </FormItem>

                    <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                            value={currentRole}
                            onValueChange={(value) =>
                                setCurrentRole(value as Role)
                            }
                        >
                            <FormControl>
                                <SelectTrigger className="w-[110px]">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">Member</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>

                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={handleAddMemberToList}
                        aria-label="Add member to list"
                        disabled={!currentEmail}
                    >
                        <LucidePlus className="w-4 h-4" />
                    </Button>
                </div>

                <FormField
                    control={form.control}
                    name="members"
                    render={() => (
                        <FormItem>
                            {/* Optional: Label/Description for the table */}
                            {fields.length > 0 && (
                                <FormLabel>Members to Add</FormLabel>
                            )}
                            {fields.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="w-[130px]">
                                                Role
                                            </TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell className="font-medium break-all">
                                                    {form.getValues(
                                                        `members.${index}.email`,
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`members.${index}.role`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select
                                                                    onValueChange={
                                                                        field.onChange
                                                                    }
                                                                    defaultValue={
                                                                        field.value
                                                                    }
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select role" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="admin">
                                                                            Admin
                                                                        </SelectItem>
                                                                        <SelectItem value="member">
                                                                            Member
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />
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
                            ) : (
                                <FormDescription>
                                    Use the fields above to add members to the
                                    list.
                                </FormDescription>
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
