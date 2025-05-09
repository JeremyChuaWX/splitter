"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { bigintToCurrency } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";

export function ClientGroupSection() {
    const trpc = useTRPC();
    const { data: groups } = useSuspenseQuery(
        trpc.getGroupsWithTotal.queryOptions(),
    );

    if (groups.length === 0) {
        return (
            <span className="text-center text-muted-foreground">No groups</span>
        );
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            {groups.map((group) => (
                <Link key={group.id} href={`/group/${group.id}`}>
                    <Card className="transition-all hover:cursor-pointer hover:bg-background">
                        <CardContent className="flex items-center">
                            <div className="flex flex-1 gap-1 items-center">
                                <CardTitle>{group.name}</CardTitle>
                            </div>
                            <span>${bigintToCurrency(group.total)}</span>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

export function ClientGroupSectionSkeleton() {
    return (
        <div className="flex flex-col gap-4 w-full">
            <Skeleton className="w-full rounded-xl h-[74px]" />
            <Skeleton className="w-full rounded-xl h-[74px]" />
            <Skeleton className="w-full rounded-xl h-[74px]" />
        </div>
    );
}
