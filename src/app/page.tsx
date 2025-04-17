import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { UserButton } from "@clerk/nextjs";

export default function Page() {
    // const trpc = useTRPC();
    // const {} = useMutation();

    return (
        <div className="flex flex-col items-center p-6 h-svh">
            <Navbar />
            <div className="flex flex-col items-center pt-48 w-full">
                <div className="flex flex-col gap-6 items-center w-2/3">
                    <div className="flex items-center w-full">
                        <h2 className="flex-1 text-xl">Groups</h2>
                        <Button variant="outline">Add Group</Button>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        <GroupCard />
                        <GroupCard />
                        <GroupCard />
                    </div>
                </div>
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

function GroupCard() {
    return (
        <Card className="transition-all hover:scale-[101%] hover:cursor-pointer">
            <CardContent className="flex items-center">
                <div className="flex flex-1 gap-1 items-center">
                    <CardTitle>Korea Trip</CardTitle>
                    <Badge variant="secondary">Owner</Badge>
                </div>
                <span>$123.45</span>
            </CardContent>
        </Card>
    );
}
