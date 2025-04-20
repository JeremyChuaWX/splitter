"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";

const GROUP = {
    group: {
        id: "04c574ae-c4d7-4691-844f-0df353727f7d",
        data: {
            name: "Korea Trip",
        },
    },
    group_membership: {
        data: {
            role: "owner",
        },
    },
};

export function GroupList() {
    const trpc = useTRPC();
    const { data: groups } = useSuspenseQuery(
        trpc.group.getForUser.queryOptions(),
    );

    return (
        <>
            {groups.map((group) => (
                <GroupCard key={group.group.id} group={group} />
            ))}
            <GroupCard group={GROUP} />
            <GroupCard group={GROUP} />
            <GroupCard group={GROUP} />
        </>
    );
}

function GroupCard({ group }: { group: any }) {
    return (
        <Link href={`/group/${group.group.id}`}>
            <Card className="transition-all hover:scale-[101%] hover:cursor-pointer">
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
