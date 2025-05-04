"use client";

import { AddItemForm } from "./add-item-form";
import { AddMembersForm } from "./add-members-form";
import { ResponsiveContainer } from "@/components/responsive-container";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LucideSettings } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

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

export function SettingsDropdown() {
    const { groupId } = useParams<{ groupId: string }>();
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

    const ContentComponent = currentItem?.content;

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
                            {SETTINGS[key].title}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            {currentItem && ContentComponent && (
                <ResponsiveContainer
                    open={itemOpen}
                    onOpenChange={setItemOpen}
                    title={currentItem.title}
                    closeComponent={<Button variant="outline">Cancel</Button>}
                    content={({ closeComponent }) => (
                        <ContentComponent
                            groupId={groupId}
                            closeComponent={closeComponent}
                            closeFunction={() => setItemOpen(false)}
                        />
                    )}
                />
            )}
        </>
    );
}
