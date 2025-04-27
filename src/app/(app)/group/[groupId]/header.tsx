"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SettingsDropdown } from "./settings-dropdown";

export function Header({ groupId }: { groupId: string }) {
    const trpc = useTRPC();
    const { data: group } = useSuspenseQuery(
        trpc.getGroup.queryOptions({ groupId: groupId }),
    );

    return (
        <div className="flex gap-2 items-center w-full">
            <h1 className="flex-1 text-2xl font-bold">{group.name}</h1>
            <SettingsDropdown groupId={groupId} />
        </div>
    );
}
