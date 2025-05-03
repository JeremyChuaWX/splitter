"use client";

import { ResponsiveContainer } from "@/components/responsive-container";
import { Button } from "@/components/ui/button";
import { LucidePlus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AddItemForm } from "./add-item-form";

export function AddItemButton() {
    const { groupId } = useParams<{ groupId: string }>();
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                className="flex gap-1 justify-center items-center w-full"
            >
                <LucidePlus size={16} />
                Add Item
            </Button>
            <ResponsiveContainer
                open={open}
                onOpenChange={setOpen}
                title="Add Item"
                closeComponent={<Button variant="outline">Cancel</Button>}
                content={({ closeComponent }) => (
                    <AddItemForm
                        groupId={groupId}
                        closeComponent={closeComponent}
                        closeFunction={() => setOpen(false)}
                    />
                )}
            />
        </>
    );
}
