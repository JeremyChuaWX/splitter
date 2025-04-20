"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
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
import { useTRPC } from "@/trpc/client";
import { createGroupSchema } from "@/trpc/routers/group/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function CreateGroupButton() {
    const [open, setOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Create Group</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create Group</DialogTitle>
                    </DialogHeader>
                    <CreateGroupForm
                        close={
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                        }
                    />
                </DialogContent>
            </Dialog>
        );
    } else {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="outline">Create Group</Button>
                </DrawerTrigger>
                <DrawerContent className="h-[90svh]">
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Create Group</DrawerTitle>
                    </DrawerHeader>
                    <CreateGroupForm
                        close={
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        }
                    />
                </DrawerContent>
            </Drawer>
        );
    }
}

function CreateGroupForm({ close }: { close: React.ReactNode }) {
    const trpc = useTRPC();
    const { mutateAsync: createGroup, isPending } = useMutation(
        trpc.group.create.mutationOptions(),
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
                            <FormLabel htmlFor="name">Group Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-2 justify-end w-full">
                    <Button type="submit" disabled={isPending}>
                        Create Group
                    </Button>
                    {close}
                </div>
            </form>
        </Form>
    );
}
