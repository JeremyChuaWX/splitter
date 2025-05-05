import { AddMembersButton } from "./add-members-button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableRow,
} from "@/components/ui/table";

export function BalanceSection() {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-medium">Balances</h2>
            <Table>
                <TableBody></TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell className="text-right" colSpan={2}>
                            $123.45
                        </TableCell>
                    </TableRow>
                </TableFooter>
                <TableCaption>
                    <AddMembersButton />
                </TableCaption>
            </Table>
        </div>
    );
}
