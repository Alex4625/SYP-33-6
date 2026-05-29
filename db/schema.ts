import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const roles = ["ADMIN", "ALUMNI"] as const;
export const accountStatuses = ["PENDING", "APPROVED", "REJECTED", "DISABLED"] as const;
export const highSchoolMajors = ["IPA", "IPS"] as const;

export type Role = (typeof roles)[number];
export type AccountStatus = (typeof accountStatuses)[number];
export type HighSchoolMajor = (typeof highSchoolMajors)[number];

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    username: text("username", { length: 50 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: roles }).notNull().default("ALUMNI"),
    status: text("status", { enum: accountStatuses }).notNull().default("PENDING"),
    rejectionReason: text("rejection_reason"),
    rememberToken: text("remember_token"),
    resetToken: text("reset_token"),
    resetTokenExpires: integer("reset_token_expires", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    statusIdx: index("users_status_idx").on(table.status),
  }),
);

export const alumniProfiles = sqliteTable(
  "alumni_profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    fullName: text("full_name", { length: 100 }).notNull(),
    highSchoolMajor: text("high_school_major", { enum: highSchoolMajors }).notNull(),
    collegeMajor: text("college_major", { length: 100 }).notNull(),
    birthPlace: text("birth_place", { length: 100 }).notNull(),
    birthDate: text("birth_date").notNull(),
    email: text("email", { length: 100 }),
    phone: text("phone", { length: 20 }),
    profilePhotoUrl: text("profile_photo_url"),
    profilePhotoKey: text("profile_photo_key"),
    address: text("address"),
    domicileCity: text("domicile_city", { length: 100 }),
    domicileProvince: text("domicile_province", { length: 100 }),
    originCity: text("origin_city", { length: 100 }),
    originProvince: text("origin_province", { length: 100 }),
    linkedinUrl: text("linkedin_url"),
    socialMedia: text("social_media"),
    portfolioUrl: text("portfolio_url"),
    bio: text("bio"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    majorIdx: index("alumni_major_idx").on(table.highSchoolMajor),
    domicileIdx: index("alumni_domicile_idx").on(table.domicileProvince),
    originIdx: index("alumni_origin_idx").on(table.originProvince),
  }),
);

export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    caption: text("caption").notNull(),
    isHidden: integer("is_hidden", { mode: "boolean" }).notNull().default(false),
    hiddenAt: integer("hidden_at", { mode: "timestamp" }),
    hiddenById: text("hidden_by").references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    hiddenIdx: index("posts_hidden_idx").on(table.isHidden),
    createdIdx: index("posts_created_idx").on(table.createdAt),
  }),
);

export const postImages = sqliteTable("post_images", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  imageKey: text("image_key").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const galleryPhotos = sqliteTable(
  "gallery_photos",
  {
    id: text("id").primaryKey(),
    uploadedById: text("uploaded_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    imageKey: text("image_key").notNull(),
    caption: text("caption"),
    isHidden: integer("is_hidden", { mode: "boolean" }).notNull().default(false),
    hiddenAt: integer("hidden_at", { mode: "timestamp" }),
    hiddenById: text("hidden_by").references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    hiddenIdx: index("gallery_hidden_idx").on(table.isHidden),
  }),
);

export const adminLogs = sqliteTable(
  "admin_logs",
  {
    id: text("id").primaryKey(),
    adminId: text("admin_id")
      .notNull()
      .references(() => users.id),
    action: text("action", { length: 100 }).notNull(),
    targetType: text("target_type", { length: 50 }).notNull(),
    targetId: text("target_id"),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    createdIdx: index("logs_created_idx").on(table.createdAt),
  }),
);

export const usersRelations = relations(users, ({ one, many }) => ({
  alumniProfile: one(alumniProfiles, {
    fields: [users.id],
    references: [alumniProfiles.userId],
  }),
  posts: many(posts, { relationName: "PostAuthor" }),
  galleryPhotos: many(galleryPhotos, { relationName: "GalleryUploader" }),
  adminLogs: many(adminLogs),
}));

export const alumniProfilesRelations = relations(alumniProfiles, ({ one }) => ({
  user: one(users, {
    fields: [alumniProfiles.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
    relationName: "PostAuthor",
  }),
  hiddenBy: one(users, {
    fields: [posts.hiddenById],
    references: [users.id],
    relationName: "PostHider",
  }),
  images: many(postImages),
}));

export const postImagesRelations = relations(postImages, ({ one }) => ({
  post: one(posts, {
    fields: [postImages.postId],
    references: [posts.id],
  }),
}));

export const galleryPhotosRelations = relations(galleryPhotos, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [galleryPhotos.uploadedById],
    references: [users.id],
    relationName: "GalleryUploader",
  }),
  hiddenBy: one(users, {
    fields: [galleryPhotos.hiddenById],
    references: [users.id],
    relationName: "GalleryHider",
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AlumniProfile = typeof alumniProfiles.$inferSelect;
export type NewAlumniProfile = typeof alumniProfiles.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostImage = typeof postImages.$inferSelect;
export type NewPostImage = typeof postImages.$inferInsert;
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type NewGalleryPhoto = typeof galleryPhotos.$inferInsert;
export type AdminLog = typeof adminLogs.$inferSelect;
export type NewAdminLog = typeof adminLogs.$inferInsert;
