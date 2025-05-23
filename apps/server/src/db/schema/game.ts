import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { cloudSaves } from "./cloudSaves";

export const gameApprovalStatusEnum = pgEnum("game_approval_status", [
	"pending",
	"approved",
	"rejected",
]);

export const game = pgTable("game", {
	id: text("id").primaryKey().notNull(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	url: text("url").notNull(),
	tags: text("tags").array(),

	approvalStatus: gameApprovalStatusEnum("approval_status")
		.default("pending")
		.notNull(),
	approvedByUserId: text("approved_by_user_id").references(() => user.id, {
		onDelete: "set null",
	}),
	approvedAt: timestamp("approved_at", { withTimezone: true }),
	rejectionReason: text("rejection_reason"),

	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	creatorId: text("creator_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const gameRelations = relations(game, ({ one, many }) => ({
	creator: one(user, {
		fields: [game.creatorId],
		references: [user.id],
		relationName: "gameCreator",
	}),
	approvedByUser: one(user, {
		fields: [game.approvedByUserId],
		references: [user.id],
		relationName: "gameApprover",
	}),
	cloudSaves: many(cloudSaves),
}));
