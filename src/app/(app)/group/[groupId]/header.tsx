"use client";

import { SettingsDropdown } from "./settings-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LucideChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

export function HeaderSkeleton() {
    return <Skeleton className="w-full h-12" />;
}
