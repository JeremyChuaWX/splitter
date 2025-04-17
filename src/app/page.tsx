"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserButton } from "@clerk/nextjs";
import { useForm } from "react-hook-form";

export default function Page() {
    // const trpc = useTRPC();
    // const {} = useMutation();

    const form = useForm({
        defaultValues: {
            groupName: "",
            groupPassword: "",
        },
    });

    async function onSubmit(data: unknown) {
        console.log(data);
    }

    return (
        <div className="flex flex-col items-center p-6 h-svh">
            <Navbar />
            <div className="pt-48">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle>Join Group</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="grid gap-6 items-center w-full"
                            >
                                <FormField
                                    control={form.control}
                                    name="groupName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Group Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Group Name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="groupPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Group Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Group password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            variant="outline"
                            className="w-full"
                        >
                            Join Group
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

function Navbar() {
    return (
        <div className="flex gap-2 w-full">
            <h1 className="flex-1 w-full text-xl font-extrabold">Splitter</h1>
            <div className="flex items-center shrink-0">
                <UserButton />
            </div>
            <ThemeToggle />
        </div>
    );
}
