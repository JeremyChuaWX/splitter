"use client";

import { ResponsiveContainer } from "@/components/responsive-container";
import { Button } from "@/components/ui/button";
import { LucidePlus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AddMembersForm } from "./add-members-form";

export function AddMembersButton() {
    const { groupId } = useParams<{ groupId: string }>();
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
                className="flex gap-1 justify-center items-center w-full"
            >
                <LucidePlus size={16} />
                Add Members
            </Button>
            <ResponsiveContainer
                open={open}
                onOpenChange={setOpen}
                title="Add Item"
                closeComponent={<Button variant="outline">Cancel</Button>}
                content={({ closeComponent }) => (
                    <AddMembersForm
                        groupId={groupId}
                        closeComponent={closeComponent}
                        closeFunction={() => setOpen(false)}
                    />
                )}
            />
        </>
    );
}
