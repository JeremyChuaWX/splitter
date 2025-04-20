"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";

export function GroupList() {
    const trpc = useTRPC();
    const { data: groups } = useSuspenseQuery(
        trpc.group.getForUser.queryOptions(),
    );

    return (
        <>
            {groups.map((group) => (
                <GroupCard key={group.group.id} />
            ))}
            <GroupCard />
            <GroupCard />
            <GroupCard />
        </>
    );
}

function GroupCard() {
    return (
        <Link href="/group/e2866d49-03cf-4bf5-a668-da86db2ef1c9">
            <Card className="transition-all hover:scale-[101%] hover:cursor-pointer">
                <CardContent className="flex items-center">
                    <div className="flex flex-1 gap-1 items-center">
                        <CardTitle>Korea Trip</CardTitle>
                        <Badge variant="secondary">Owner</Badge>
                    </div>
                    <span>$123.45</span>
                </CardContent>
            </Card>
        </Link>
    );
}
