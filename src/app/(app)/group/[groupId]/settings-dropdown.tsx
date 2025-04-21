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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { createItemSchema } from "@/trpc/routers/item/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LucideLoaderCircle, LucideSettings } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type SettingsContentProps = {
    groupId: string;
    closeFunction: () => void;
    closeComponent: React.ReactNode;
};

type SettingsItem = {
    title: React.ReactNode;
    content: (props: SettingsContentProps) => React.ReactNode;
};

const SETTINGS = {
    "add-item": {
        title: "add-item title",
        content: AddItemForm,
    } satisfies SettingsItem,
    "add-member": {
        title: "add-member title",
        content: AddItemForm,
    } satisfies SettingsItem,
};

export function SettingsDropdown({ groupId }: { groupId: string }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [itemOpen, setItemOpen] = useState(false);
    const [content, setContent] = useState<keyof typeof SETTINGS>();
    const currentItem = useMemo(() => {
        if (content) {
            return SETTINGS[content];
        }
    }, [content]);

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger>
                    <LucideSettings className="text-primary" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => {
                            setDropdownOpen(false);
                            setItemOpen(true);
                            setContent("add-item");
                        }}
                    >
                        Add Item
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setDropdownOpen(false);
                            setItemOpen(true);
                            setContent("add-member");
                        }}
                    >
                        Add Member
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <SettingsContainer
                groupId={groupId}
                open={itemOpen}
                onOpenChange={setItemOpen}
                title={currentItem?.title}
                content={currentItem?.content}
            />
        </>
    );
}

function SettingsContainer({
    groupId,
    open,
    onOpenChange,
    title,
    content,
}: {
    groupId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    content: (props: SettingsContentProps) => React.ReactNode | undefined;
}) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    {content &&
                        content({
                            groupId: groupId,
                            closeFunction: () => onOpenChange(false),
                            closeComponent: (
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                            ),
                        })}
                </DialogContent>
            </Dialog>
        );
    } else {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="h-[90svh]">
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    {content &&
                        content({
                            groupId: groupId,
                            closeFunction: () => onOpenChange(false),
                            closeComponent: (
                                <DrawerClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DrawerClose>
                            ),
                        })}
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
        },
    });
    async function onSubmit(data: z.infer<typeof createItemFormSchema>) {
        await createItem({
            name: data.name,
            groupId: groupId,
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
                            <FormLabel htmlFor="name">Item Name</FormLabel>
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
