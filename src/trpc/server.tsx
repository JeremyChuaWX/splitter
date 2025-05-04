import { createTRPCContext } from ".";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
    createTRPCOptionsProxy,
    type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { cache } from "react";
import "server-only";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
    ctx: createTRPCContext,
    router: appRouter,
    queryClient: getQueryClient,
});

export function HydrateClient(props: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {props.children}
        </HydrationBoundary>
    );
}

// eslint-disable-next-line
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
    queryOptions: T,
) {
    const queryClient = getQueryClient();
    if (queryOptions.queryKey[1]?.type === "infinite") {
        void queryClient.prefetchInfiniteQuery(queryOptions as any); // eslint-disable-line
    } else {
        void queryClient.prefetchQuery(queryOptions);
    }
}
