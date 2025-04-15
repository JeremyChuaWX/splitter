import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import Greeting from "./greeting";

export default function Home() {
    prefetch(trpc.greeting.hello.queryOptions());

    return (
        <HydrateClient>
            <Greeting />
        </HydrateClient>
    );
}
