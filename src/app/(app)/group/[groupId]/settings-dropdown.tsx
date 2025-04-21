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
    content: React.ComponentType<SettingsContentProps>;
};

const SETTINGS = {
    "add-item": {
        title: "Add Item",
        content: AddItemForm,
    } satisfies SettingsItem,
    "add-member": {
        title: "Add Member",
        content: AddItemForm,
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
    ) : null; // Render null if no component is provided

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
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
                            <FormLabel>Item Name</FormLabel>
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
                            Create Group
                        </span>
                    </Button>
                    {closeComponent}
                </div>
            </form>
        </Form>
    );
}
