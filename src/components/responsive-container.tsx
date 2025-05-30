"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { isValidElement, useMemo } from "react";

type ResponsiveContainerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    content: ({
        closeComponent,
    }: {
        closeComponent: React.ReactNode;
    }) => React.ReactNode;
    triggerComponent?: React.ReactNode;
    closeComponent: React.ReactNode;
    dialogClassName?: string;
    drawerClassName?: string;
    drawerContentWrapperClassName?: string;
};

export function ResponsiveContainer({
    open,
    onOpenChange,
    title,
    content,
    triggerComponent,
    closeComponent,
    dialogClassName = "sm:max-w-[500px]",
    drawerClassName = "h-[90svh]",
    drawerContentWrapperClassName = "overflow-auto p-6",
}: ResponsiveContainerProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const wrappedTriggerComponent = useMemo(() => {
        if (!isValidElement(triggerComponent)) {
            return null;
        }
        if (isDesktop) {
            return <DialogTrigger asChild>{triggerComponent}</DialogTrigger>;
        } else {
            return <DrawerTrigger asChild>{triggerComponent}</DrawerTrigger>;
        }
    }, [isDesktop, triggerComponent]);

    const wrappedCloseComponent = useMemo(() => {
        if (!isValidElement(closeComponent)) {
            return null;
        }
        if (isDesktop) {
            return <DialogClose asChild>{closeComponent}</DialogClose>;
        } else {
            return <DrawerClose asChild>{closeComponent}</DrawerClose>;
        }
    }, [isDesktop, closeComponent]);

    const renderedContent = content({ closeComponent: wrappedCloseComponent });

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                {wrappedTriggerComponent}
                <DialogContent className={dialogClassName}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    {renderedContent}
                </DialogContent>
            </Dialog>
        );
    } else {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                {wrappedTriggerComponent}
                <DrawerContent className={drawerClassName}>
                    <DrawerHeader className="text-left">
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    <div className={drawerContentWrapperClassName}>
                        {renderedContent}
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }
}
