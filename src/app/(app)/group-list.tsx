"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";

export function GroupList() {
    const trpc = useTRPC();
    const { data: groups } = useSuspenseQuery(trpc.getGroups.queryOptions());

    if (groups.length === 0) {
        return (
            <span className="text-center text-muted-foreground">No groups</span>
        );
    }

    return (
        <>
            {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
            ))}
        </>
    );
}

function GroupCard({
    group,
}: {
    group: { id: string; name: string; role: string };
}) {
    return (
        <Link href={`/group/${group.id}`}>
            <Card className="transition-all hover:cursor-pointer hover:bg-background">
                <CardContent className="flex items-center">
                    <div className="flex flex-1 gap-1 items-center">
                        <CardTitle>{group.name}</CardTitle>
                        <Badge variant="secondary" className="capitalize">
                            {group.role}
                        </Badge>
                    </div>
                    <span>$123.45</span>
                </CardContent>
            </Card>
        </Link>
    );
}
