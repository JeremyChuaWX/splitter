"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SettingsDropdown } from "./settings-dropdown";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LucideChevronLeft } from "lucide-react";

export function Header() {
    const { groupId } = useParams<{ groupId: string }>();
    const trpc = useTRPC();
    const { data: group } = useSuspenseQuery(
        trpc.getGroup.queryOptions({ groupId: groupId }),
    );

    return (
        <div className="flex gap-2 items-center w-full">
            <div className="flex-1">
                <Link href="/" className="flex gap-1 items-center w-min">
                    <LucideChevronLeft size={24} />
                    <h1 className="text-2xl font-bold">{group.name}</h1>
                </Link>
            </div>
            <SettingsDropdown />
        </div>
    );
}
