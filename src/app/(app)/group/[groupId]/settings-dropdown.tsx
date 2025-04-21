"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
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
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { addMembersSchema } from "@/trpc/routers/group/validators";
import { createItemSchema } from "@/trpc/routers/item/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    LucideLoaderCircle,
    LucidePlus,
    LucideSettings,
    LucideTrash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type SettingsContentProps = {
    groupId: string;
    closeFunction: () => void;
    closeComponent: React.ReactNode;
};

type SettingsItem = {
    title: React.ReactNode;
    content: React.ComponentType<SettingsContentProps>;
};

const SETTINGS = {
    "add-item": {
        title: "Add Item",
        content: AddItemForm,
    } satisfies SettingsItem,
    "add-members": {
        title: "Add Members",
        content: AddMembersForm,
    } satisfies SettingsItem,
};

type SettingsKey = keyof typeof SETTINGS;

export function SettingsDropdown({ groupId }: { groupId: string }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [itemOpen, setItemOpen] = useState(false);
    const [contentKey, setContentKey] = useState<SettingsKey>();
    const currentItem = useMemo(() => {
        if (contentKey) {
            return SETTINGS[contentKey];
        }
        return undefined;
    }, [contentKey]);
    function handleOpenItem(key: SettingsKey) {
        setDropdownOpen(false);
        setContentKey(key);
        setItemOpen(true);
    }

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <LucideSettings className="text-primary" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {(Object.keys(SETTINGS) as SettingsKey[]).map((key) => (
                        <DropdownMenuItem
                            key={key}
                            onClick={() => handleOpenItem(key)}
                        >
                            {SETTINGS[key].title} {/* Use title from config */}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            {currentItem && (
                <SettingsContainer
                    groupId={groupId}
                    open={itemOpen}
                    onOpenChange={setItemOpen}
                    title={currentItem.title}
                    Content={currentItem.content}
                />
            )}
        </>
    );
}

function SettingsContainer({
    groupId,
    open,
    onOpenChange,
    title,
    Content,
}: {
    groupId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    Content: React.ComponentType<SettingsContentProps> | undefined;
}) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const closeComponent = useMemo(() => {
        const CloseButton = <Button variant="outline">Cancel</Button>;
        return isDesktop ? (
            <DialogClose asChild>{CloseButton}</DialogClose>
        ) : (
            <DrawerClose asChild>{CloseButton}</DrawerClose>
        );
    }, [isDesktop]);

    const renderedContent = Content ? (
        <Content
            groupId={groupId}
            closeFunction={() => onOpenChange(false)}
            closeComponent={closeComponent}
        />
    ) : null;

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    {renderedContent}
                </DialogContent>
            </Dialog>
        );
    } else {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="h-[90svh]">
                    <DrawerHeader className="text-left">
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    <div className="overflow-auto p-6">{renderedContent}</div>
                </DrawerContent>
            </Drawer>
        );
    }
}

function AddItemForm({
    groupId,
    closeFunction,
    closeComponent,
}: SettingsContentProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { mutateAsync: createItem, isPending } = useMutation(
        trpc.item.create.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.item.getForGroup.queryKey(),
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
    const createItemFormSchema = createItemSchema.omit({ groupId: true });
    const form = useForm<z.infer<typeof createItemFormSchema>>({
        resolver: zodResolver(createItemFormSchema),
        defaultValues: {
            name: "",
            amount: "",
        },
    });
    async function onSubmit(data: z.infer<typeof createItemFormSchema>) {
        await createItem({
            groupId: groupId,
            name: data.name,
            amount: data.amount,
        });
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
                            <LucideLoaderCircle className="absolute inset-0 m-auto w-4 h-4 animate-spin" />
                        )}
                        <span className={cn(isPending ? "invisible" : "")}>
                            Add Item
                        </span>
                    </Button>
                    {closeComponent}
                </div>
            </form>
        </Form>
    );
}

function AddMembersForm({
    groupId,
    closeFunction,
    closeComponent,
}: SettingsContentProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [currentEmail, setCurrentEmail] = useState("");
    const [currentRole, setCurrentRole] = useState<"admin" | "member">(
        "member",
    );

    const addMembersFormSchema = addMembersSchema.omit({ groupId: true });

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
        trpc.group.addMembers.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({});
                toast.success("Members added successfully");
                form.reset();
                setCurrentEmail("");
                setCurrentRole("member");
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
        setCurrentRole("member");
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
                            onValueChange={(value: "admin" | "member") =>
                                setCurrentRole(value)
                            }
                        >
                            <FormControl>
                                <SelectTrigger className="w-[110px]">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
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
