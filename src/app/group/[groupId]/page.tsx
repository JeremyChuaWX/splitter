import { Button } from "@/components/ui/button";

type Props = {
    params: Promise<{ groupId: string }>;
};

export default async function Page({ params }: Props) {
    const { groupId } = await params;

    return (
        <div className="flex flex-col items-center p-6 h-svh">
            <h1 className="w-full text-xl font-extrabold">Splitter</h1>

            <div className="flex flex-col gap-12 pt-24 w-2/3">
                <div className="flex justify-between w-full">
                    <h1 className="text-2xl font-bold">Korea Trip</h1>
                    <Button variant="outline">Settings</Button>
                </div>

                <div className="w-full">
                    <div className="flex justify-between w-full">
                        <h2 className="text-xl">Items</h2>
                        <Button variant="outline">Add Item</Button>
                    </div>
                </div>

                <div className="w-full">
                    <div className="flex justify-between w-full">
                        <h2 className="text-xl">Balances</h2>
                        {/* <Button variant="outline">Add Member</Button> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
