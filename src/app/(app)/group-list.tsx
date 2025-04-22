"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { Group, GroupMembership } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";

export function GroupList() {
    const trpc = useTRPC();
    const { data: groups } = useSuspenseQuery(
        trpc.group.getForUser.queryOptions(),
    );

    if (groups.length === 0) {
        return (
            <span className="text-center text-muted-foreground">No groups</span>
        );
    }

    return (
        <>
            {groups.map((group) => (
                <GroupCard key={group.group.id} group={group} />
            ))}
        </>
    );
}

function GroupCard({
    group,
}: {
    group: { group: Group; group_membership: GroupMembership };
}) {
    return (
        <Link href={`/group/${group.group.id}`}>
            <Card className="transition-all hover:cursor-pointer hover:bg-background">
                <CardContent className="flex items-center">
                    <div className="flex flex-1 gap-1 items-center">
                        <CardTitle>{group.group.data.name}</CardTitle>
                        <Badge variant="secondary" className="capitalize">
                            {group.group_membership.data.role}
                        </Badge>
                    </div>
                    <span>$123.45</span>
                </CardContent>
            </Card>
        </Link>
    );
}
