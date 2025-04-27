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
import { useMediaQuery } from "@/hooks/use-media-query";
import { LucideSettings } from "lucide-react";
import { useMemo, useState } from "react";
import { AddItemForm } from "./add-item-form";
import { AddMembersForm } from "./add-members-form";

export type SettingsContentProps = {
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
                            className="cursor-pointer"
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
