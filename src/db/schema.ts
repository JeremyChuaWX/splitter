import {
    bigint,
    json,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";

const timestamps = {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdateFn(
        () => new Date(),
    ),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

export const groupDataSchema = z.object({ name: z.string().nonempty() });

export const groupTable = pgTable("group", {
    id: uuid("id").primaryKey().defaultRandom(),
    data: json("data").$type<z.infer<typeof groupDataSchema>>().notNull(),
    ...timestamps,
});

export const itemDataSchema = z.object({
    name: z.string().nonempty(),
});

export const itemTable = pgTable("item", {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
        .notNull()
        .references(() => groupTable.id, { onDelete: "restrict" }),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    data: json("data").$type<z.infer<typeof itemDataSchema>>().notNull(),
    ...timestamps,
});

export const membershipDataSchema = z.object({});

export const membershipTable = pgTable(
    "membership",
    {
        userId: text("user_id").notNull(),
        groupId: uuid("group_id")
            .notNull()
            .references(() => groupTable.id, { onDelete: "restrict" }),
        data: json("data")
            .$type<z.infer<typeof membershipDataSchema>>()
            .notNull(),
    },
    (t) => [primaryKey({ columns: [t.userId, t.groupId] })],
);

export const debitTable = pgTable(
    "debit",
    {
        userId: text("user_id").notNull(),
        itemId: uuid("item_id")
            .notNull()
            .references(() => itemTable.id, { onDelete: "restrict" }),
        amount: bigint("amount", { mode: "bigint" }).notNull(),
        // data: json("data").$type<{}>().notNull(),
        data: json("data").notNull(),
    },
    (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
);

export const creditTable = pgTable(
    "credit",
    {
        userId: text("user_id").notNull(),
        itemId: uuid("item_id")
            .notNull()
            .references(() => itemTable.id, { onDelete: "restrict" }),
        amount: bigint("amount", { mode: "bigint" }).notNull(),
        // data: json("data").$type<{}>().notNull(),
        data: json("data").notNull(),
    },
    (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
);
