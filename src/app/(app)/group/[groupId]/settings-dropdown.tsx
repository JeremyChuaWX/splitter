"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LucideSettings } from "lucide-react";
import { useState } from "react";

export function SettingsDropdown({ groupId }: { groupId: string }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<"add-item" | "add-member">();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <LucideSettings className="text-primary" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DialogTrigger
                            asChild
                            onClick={() => setForm("add-item")}
                        >
                            <DropdownMenuItem>Add Item</DropdownMenuItem>
                        </DialogTrigger>
                        <DialogTrigger
                            asChild
                            onClick={() => setForm("add-member")}
                        >
                            <DropdownMenuItem>Add Member</DropdownMenuItem>
                        </DialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DialogContent className="sm:max-w-[425px]">
                    {form === "add-item" && <div>add item</div>}
                    {form === "add-member" && <div>add member</div>}
                </DialogContent>
            </Dialog>
        );
    } else {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <LucideSettings className="text-primary" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DrawerTrigger
                            asChild
                            onClick={() => setForm("add-item")}
                        >
                            <DropdownMenuItem>Add Item</DropdownMenuItem>
                        </DrawerTrigger>
                        <DrawerTrigger
                            asChild
                            onClick={() => setForm("add-member")}
                        >
                            <DropdownMenuItem>Add Member</DropdownMenuItem>
                        </DrawerTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DrawerContent className="h-[90svh]">
                    {form === "add-item" && <div>add item</div>}
                    {form === "add-member" && <div>add member</div>}
                </DrawerContent>
            </Drawer>
        );
    }
}
