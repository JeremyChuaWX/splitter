import {
    bigint,
    json,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdateFn(
        () => new Date(),
    ),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

export const groupTable = pgTable("group", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    // data: json("data").$type<{}>().notNull(),
    data: json("data").notNull(),
    ...timestamps,
});

export type Group = typeof groupTable.$inferSelect;

export const itemTable = pgTable("item", {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
        .notNull()
        .references(() => groupTable.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    // data: json("data").$type<{}>().notNull(),
    data: json("data").notNull(),
    ...timestamps,
});

export type Item = typeof itemTable.$inferSelect;

export const groupMembershipTable = pgTable(
    "group_membership",
    {
        userId: text("user_id").notNull(),
        groupId: uuid("group_id")
            .notNull()
            .references(() => groupTable.id, { onDelete: "restrict" }),
        // data: json("data").$type<{}>().notNull(),
        data: json("data").notNull(),
    },
    (t) => [primaryKey({ columns: [t.userId, t.groupId] })],
);

export type GroupMembership = typeof groupMembershipTable.$inferSelect;

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

export type Debit = typeof debitTable.$inferSelect;

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

export type Credit = typeof creditTable.$inferSelect;
