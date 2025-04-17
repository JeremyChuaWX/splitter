import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col items-center p-6 h-svh">
            <Navbar />
            {children}
        </div>
    );
}

function Navbar() {
    return (
        <div className="flex gap-2 w-full">
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
