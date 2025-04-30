import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col items-center h-svh w-svw">
            <Navbar />
            <div className="p-6 w-full h-full max-w-[650px]">{children}</div>
        </div>
    );
}

function Navbar() {
    return (
        <div className="flex gap-2 items-center p-4 w-full border-b">
            <h1 className="flex-1 w-full text-xl font-extrabold">
                <Link href="/">Splitter</Link>
            </h1>
            <div className="flex items-center shrink-0">
                <UserButton />
            </div>
            <ThemeToggle />
        </div>
    );
}
