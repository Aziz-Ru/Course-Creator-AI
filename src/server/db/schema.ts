import { relations, sql } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTableCreator,
  primaryKey,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `learning_journey_${name}`);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// courses
export const courses = createTable(
  "course",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    title: d.varchar({ length: 256 }),
    image: d.varchar({ length: 256 }),
    createdById: d
      .varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  }),
  (t) => [
    foreignKey({
      columns: [t.createdById],
      foreignColumns: [users.id],
      name: "created_by_fk",
    }),
    index("created_by_idx").on(t.createdById),
  ],
);

export const units = createTable(
  "units",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.varchar({ length: 256 }),
    courseId: d
      .uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
  }),
  (t) => [
    index("course_id_idx").on(t.courseId),
    foreignKey({
      columns: [t.courseId],
      foreignColumns: [courses.id],
      name: "course_id_fk",
    }),
  ],
);

export const chapters = createTable(
  "chapters",
  (d) => ({
    id: d.uuid("id").primaryKey().defaultRandom(),
    unitId: d
      .uuid("unit_id")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    name: d.varchar("chapter_name", { length: 256 }).notNull(),
    youtubeSearchQuery: d.varchar({ length: 256 }),
    videoId: d.varchar({ length: 256 }),
    summery: d.text(),
  }),
  (t) => [
    foreignKey({
      columns: [t.unitId],
      foreignColumns: [units.id],
      name: "unit_id_fk",
    }),
    index("unit_id_idx").on(t.unitId),
  ],
);

export const Questions = createTable(
  "questions",
  (d) => ({
    id: d.uuid("id").primaryKey().defaultRandom(),
    chapterId: d
      .uuid("chapter_id")
      .notNull()
      .references(() => chapters.id, {
        onDelete: "cascade",
      }),
    question: d.text("question"),
    answer: d.text("answer"),
    options: d.jsonb(),
  }),
  (t) => [
    index("chapter_id_idx").on(t.chapterId),
    foreignKey({
      columns: [t.chapterId],
      foreignColumns: [chapters.id],
      name: "chapter_id_fk",
    }),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [courses.createdById],
    references: [users.id],
  }),
  units: many(units),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  unit: one(units, {
    fields: [chapters.unitId],
    references: [units.id],
  }),
  questions: many(Questions),
}));

export const QuestionsRelations = relations(Questions, ({ one }) => ({
  chapter: one(chapters, {
    fields: [Questions.chapterId],
    references: [chapters.id],
  }),
}));
