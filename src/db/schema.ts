import {
    json,
    pgTable,
    primaryKey,
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

export const user = pgTable("user", {
    id: uuid("id").primaryKey().defaultRandom(),
    data: json("data"),
    ...timestamps,
});

export const group = pgTable("group", {
    id: uuid("id").primaryKey().defaultRandom(),
    data: json("data"),
    ...timestamps,
});

export const item = pgTable("item", {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
        .notNull()
        .references(() => group.id, { onDelete: "restrict" }),
    data: json("data"),
    ...timestamps,
});

export const groupMembership = pgTable(
    "group_membership",
    {
        userId: uuid("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "restrict" }),
        groupId: uuid("group_id")
            .notNull()
            .references(() => group.id, { onDelete: "restrict" }),
        data: json("data"),
    },
    (t) => [primaryKey({ columns: [t.userId, t.groupId] })],
);

export const debit = pgTable(
    "debit",
    {
        userId: uuid("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "restrict" }),
        itemId: uuid("item_id")
            .notNull()
            .references(() => item.id, { onDelete: "restrict" }),
        data: json("data"),
    },
    (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
);

export const credit = pgTable(
    "credit",
    {
        userId: uuid("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "restrict" }),
        itemId: uuid("item_id")
            .notNull()
            .references(() => item.id, { onDelete: "restrict" }),
        data: json("data"),
    },
    (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
);
