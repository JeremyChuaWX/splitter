import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex w-full h-[80svh] items-center-safe justify-center-safe">
            <SignIn />
        </div>
    );
}
