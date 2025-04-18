"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";

export function GroupsComponent() {
    const trpc = useTRPC();
    const { data: groups } = useSuspenseQuery(trpc.group.getAll.queryOptions());

    return (
        <div className="flex flex-col gap-4 w-full">
            <GroupCard />
            <GroupCard />
            <GroupCard />
        </div>
    );
}

function GroupCard() {
    return (
        <Link href="/group/123">
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
