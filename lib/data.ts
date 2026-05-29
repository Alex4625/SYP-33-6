import { and, asc, count, desc, eq, gte, inArray, isNotNull, like, lt, or, sql } from "drizzle-orm";

import { getCloudflareDb, type Database } from "@/db";
import {
  adminLogs,
  alumniProfiles,
  galleryPhotos,
  postImages,
  posts,
  users,
  type AccountStatus,
  type HighSchoolMajor,
} from "@/db/schema";

type AlumniFilters = {
  q?: string;
  jurusan?: string;
  prodi?: string;
  domisili?: string;
  domicileCity?: string;
  domicileProvince?: string;
  originCity?: string;
  originProvince?: string;
};

type AdminUserFilters = {
  q?: string;
  status?: string;
  limit: number;
  offset: number;
};

type StatusFilter = "" | "public" | "hidden";

function contains(value: string) {
  return `%${value.trim()}%`;
}

function compactFilters<T>(values: (T | undefined | false | "")[]) {
  return values.filter(Boolean) as T[];
}

function profileCard(row: {
  fullName: string;
  highSchoolMajor: HighSchoolMajor;
  collegeMajor: string;
  domicileCity: string | null;
  domicileProvince: string | null;
  profilePhotoUrl: string | null;
  username: string;
}) {
  return {
    fullName: row.fullName,
    highSchoolMajor: row.highSchoolMajor,
    collegeMajor: row.collegeMajor,
    domicileCity: row.domicileCity,
    domicileProvince: row.domicileProvince,
    profilePhotoUrl: row.profilePhotoUrl,
    user: { username: row.username },
  };
}

function groupImages(rows: { id: string; postId: string; imageUrl: string; orderIndex: number }[]) {
  const map = new Map<string, { id: string; imageUrl: string; orderIndex: number }[]>();

  for (const image of rows) {
    const current = map.get(image.postId) ?? [];
    current.push({ id: image.id, imageUrl: image.imageUrl, orderIndex: image.orderIndex });
    map.set(image.postId, current);
  }

  return map;
}

function postCards(
  rows: {
    id: string;
    caption: string;
    createdAt: Date;
    username: string;
    fullName: string | null;
    profilePhotoUrl: string | null;
  }[],
  imageMap: Map<string, { id: string; imageUrl: string; orderIndex: number }[]>,
) {
  return rows.map((post) => ({
    id: post.id,
    caption: post.caption,
    createdAt: post.createdAt,
    author: {
      username: post.username,
      alumniProfile: post.fullName
        ? {
            fullName: post.fullName,
            profilePhotoUrl: post.profilePhotoUrl,
          }
        : null,
    },
    images: imageMap.get(post.id) ?? [],
  }));
}

function alumniWhere(filters: AlumniFilters) {
  const conditions = compactFilters([
    eq(users.role, "ALUMNI"),
    eq(users.status, "APPROVED"),
    filters.q ? like(alumniProfiles.fullName, contains(filters.q)) : undefined,
    filters.jurusan === "IPA" || filters.jurusan === "IPS"
      ? eq(alumniProfiles.highSchoolMajor, filters.jurusan)
      : undefined,
    filters.prodi ? like(alumniProfiles.collegeMajor, contains(filters.prodi)) : undefined,
    filters.domisili
      ? or(
          like(alumniProfiles.domicileCity, contains(filters.domisili)),
          like(alumniProfiles.domicileProvince, contains(filters.domisili)),
          like(alumniProfiles.originCity, contains(filters.domisili)),
          like(alumniProfiles.originProvince, contains(filters.domisili)),
        )
      : undefined,
    filters.domicileCity ? like(alumniProfiles.domicileCity, contains(filters.domicileCity)) : undefined,
    filters.domicileProvince ? like(alumniProfiles.domicileProvince, contains(filters.domicileProvince)) : undefined,
    filters.originCity ? like(alumniProfiles.originCity, contains(filters.originCity)) : undefined,
    filters.originProvince ? like(alumniProfiles.originProvince, contains(filters.originProvince)) : undefined,
  ]);

  return and(...conditions);
}

export async function getHomeData() {
  const db = await getCloudflareDb();

  const [totals, latestAlumni, latestPosts] = await Promise.all([
    db.all<{ totalAlumni: number; totalPosts: number; totalGallery: number }>(sql`
      select
        (select count(*) from users where role = 'ALUMNI' and status = 'APPROVED') as totalAlumni,
        (select count(*) from posts where is_hidden = 0) as totalPosts,
        (select count(*) from gallery_photos where is_hidden = 0) as totalGallery
    `),
    getAlumniCards({}, 6, 0, db),
    getPostCards({ limit: 3, offset: 0, publicOnly: true }, db),
  ]);
  const counts = totals[0];

  return {
    totalAlumni: counts?.totalAlumni ?? 0,
    totalPosts: counts?.totalPosts ?? 0,
    totalGallery: counts?.totalGallery ?? 0,
    latestAlumni,
    latestPosts,
  };
}

export async function getAlumniCards(filters: AlumniFilters, limit: number, offset: number, database?: Database) {
  const db = database ?? await getCloudflareDb();
  const rows = await db
    .select({
      fullName: alumniProfiles.fullName,
      highSchoolMajor: alumniProfiles.highSchoolMajor,
      collegeMajor: alumniProfiles.collegeMajor,
      domicileCity: alumniProfiles.domicileCity,
      domicileProvince: alumniProfiles.domicileProvince,
      profilePhotoUrl: alumniProfiles.profilePhotoUrl,
      username: users.username,
    })
    .from(alumniProfiles)
    .innerJoin(users, eq(alumniProfiles.userId, users.id))
    .where(alumniWhere(filters))
    .orderBy(asc(alumniProfiles.fullName))
    .limit(limit)
    .offset(offset);

  return rows.map(profileCard);
}

export async function countAlumniCards(filters: AlumniFilters) {
  const db = await getCloudflareDb();
  const rows = await db
    .select({ value: count() })
    .from(alumniProfiles)
    .innerJoin(users, eq(alumniProfiles.userId, users.id))
    .where(alumniWhere(filters));

  return rows[0]?.value ?? 0;
}

export async function getPostCards({
  limit,
  offset = 0,
  publicOnly = false,
  userId,
}: {
  limit: number;
  offset?: number;
  publicOnly?: boolean;
  userId?: string;
}, database?: Database) {
  const db = database ?? await getCloudflareDb();
  const conditions = compactFilters([
    publicOnly ? eq(posts.isHidden, false) : undefined,
    publicOnly ? eq(users.status, "APPROVED") : undefined,
    userId ? eq(posts.userId, userId) : undefined,
  ]);

  const rows = await db
    .select({
      id: posts.id,
      caption: posts.caption,
      createdAt: posts.createdAt,
      username: users.username,
      fullName: alumniProfiles.fullName,
      profilePhotoUrl: alumniProfiles.profilePhotoUrl,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(alumniProfiles, eq(alumniProfiles.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  const postIds = rows.map((post) => post.id);
  const images = postIds.length
    ? await db
        .select({
          id: postImages.id,
          postId: postImages.postId,
          imageUrl: postImages.imageUrl,
          orderIndex: postImages.orderIndex,
        })
        .from(postImages)
        .where(inArray(postImages.postId, postIds))
        .orderBy(asc(postImages.orderIndex))
    : [];

  return postCards(rows, groupImages(images));
}

export async function countPublicPosts() {
  const db = await getCloudflareDb();
  const rows = await db
    .select({ value: count() })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(and(eq(posts.isHidden, false), eq(users.status, "APPROVED")));

  return rows[0]?.value ?? 0;
}

export async function getPublicAlumniProfile(username: string) {
  const db = await getCloudflareDb();
  const [row] = await db
    .select({
      id: users.id,
      username: users.username,
      fullName: alumniProfiles.fullName,
      highSchoolMajor: alumniProfiles.highSchoolMajor,
      collegeMajor: alumniProfiles.collegeMajor,
      birthPlace: alumniProfiles.birthPlace,
      birthDate: alumniProfiles.birthDate,
      profilePhotoUrl: alumniProfiles.profilePhotoUrl,
      domicileCity: alumniProfiles.domicileCity,
      domicileProvince: alumniProfiles.domicileProvince,
      originCity: alumniProfiles.originCity,
      originProvince: alumniProfiles.originProvince,
      linkedinUrl: alumniProfiles.linkedinUrl,
      socialMedia: alumniProfiles.socialMedia,
      portfolioUrl: alumniProfiles.portfolioUrl,
      bio: alumniProfiles.bio,
    })
    .from(alumniProfiles)
    .innerJoin(users, eq(alumniProfiles.userId, users.id))
    .where(and(eq(users.username, username), eq(users.role, "ALUMNI"), eq(users.status, "APPROVED")))
    .limit(1);

  if (!row) return null;

  return {
    ...row,
    user: {
      id: row.id,
      username: row.username,
      posts: await getPostCards({ limit: 6, publicOnly: true, userId: row.id }),
    },
  };
}

export async function getGalleryPhotos({ limit, offset = 0, publicOnly = false }: { limit: number; offset?: number; publicOnly?: boolean }) {
  const db = await getCloudflareDb();
  const rows = await db
    .select({
      id: galleryPhotos.id,
      imageUrl: galleryPhotos.imageUrl,
      caption: galleryPhotos.caption,
      createdAt: galleryPhotos.createdAt,
      username: users.username,
      fullName: alumniProfiles.fullName,
    })
    .from(galleryPhotos)
    .innerJoin(users, eq(galleryPhotos.uploadedById, users.id))
    .leftJoin(alumniProfiles, eq(alumniProfiles.userId, users.id))
    .where(publicOnly ? eq(galleryPhotos.isHidden, false) : undefined)
    .orderBy(desc(galleryPhotos.createdAt))
    .limit(limit)
    .offset(offset);

  return rows.map((photo) => ({
    id: photo.id,
    imageUrl: photo.imageUrl,
    caption: photo.caption,
    createdAt: photo.createdAt,
    uploadedBy: {
      username: photo.username,
      alumniProfile: photo.fullName ? { fullName: photo.fullName } : null,
    },
  }));
}

export async function countGalleryPhotos(publicOnly = false) {
  const db = await getCloudflareDb();
  const rows = await db
    .select({ value: count() })
    .from(galleryPhotos)
    .where(publicOnly ? eq(galleryPhotos.isHidden, false) : undefined);

  return rows[0]?.value ?? 0;
}

export async function getProfileByUserId(userId: string) {
  const db = await getCloudflareDb();
  const [profile] = await db.select().from(alumniProfiles).where(eq(alumniProfiles.userId, userId)).limit(1);
  return profile ?? null;
}

export async function getUserWithProfileById(id: string) {
  const db = await getCloudflareDb();
  const [row] = await db
    .select({ user: users, alumniProfile: alumniProfiles })
    .from(users)
    .leftJoin(alumniProfiles, eq(alumniProfiles.userId, users.id))
    .where(eq(users.id, id))
    .limit(1);

  if (!row) return null;
  return { ...row.user, alumniProfile: row.alumniProfile };
}

export async function getPendingUsers() {
  const db = await getCloudflareDb();
  const rows = await db
    .select({ user: users, alumniProfile: alumniProfiles })
    .from(users)
    .leftJoin(alumniProfiles, eq(alumniProfiles.userId, users.id))
    .where(and(eq(users.role, "ALUMNI"), eq(users.status, "PENDING")))
    .orderBy(asc(users.createdAt));

  return rows.map((row) => ({ ...row.user, alumniProfile: row.alumniProfile }));
}

function adminUsersWhere({ q, status }: Pick<AdminUserFilters, "q" | "status">) {
  const validStatus = ["PENDING", "APPROVED", "REJECTED", "DISABLED"].includes(status ?? "")
    ? (status as AccountStatus)
    : undefined;

  return and(
    ...compactFilters([
      eq(users.role, "ALUMNI"),
      validStatus ? eq(users.status, validStatus) : undefined,
      q ? or(like(users.username, contains(q)), like(alumniProfiles.fullName, contains(q))) : undefined,
    ]),
  );
}

export async function getAdminUsers(filters: AdminUserFilters) {
  const db = await getCloudflareDb();
  const where = adminUsersWhere(filters);

  const [rows, totalRows] = await Promise.all([
    db
      .select({ user: users, alumniProfile: alumniProfiles })
      .from(users)
      .leftJoin(alumniProfiles, eq(alumniProfiles.userId, users.id))
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(filters.limit)
      .offset(filters.offset),
    db
      .select({ value: count() })
      .from(users)
      .leftJoin(alumniProfiles, eq(alumniProfiles.userId, users.id))
      .where(where),
  ]);

  return {
    users: rows.map((row) => ({ ...row.user, alumniProfile: row.alumniProfile })),
    total: totalRows[0]?.value ?? 0,
  };
}

function statusWhere(table: typeof posts | typeof galleryPhotos, status: string) {
  if (status === "hidden") return eq(table.isHidden, true);
  if (status === "public") return eq(table.isHidden, false);
  return undefined;
}

export async function getAdminPosts({ q, status }: { q?: string; status?: StatusFilter | string }) {
  const db = await getCloudflareDb();
  const where = and(
    ...compactFilters([
      statusWhere(posts, status ?? ""),
      q ? like(alumniProfiles.fullName, contains(q)) : undefined,
    ]),
  );

  const rows = await db
    .select({
      id: posts.id,
      caption: posts.caption,
      isHidden: posts.isHidden,
      createdAt: posts.createdAt,
      username: users.username,
      fullName: alumniProfiles.fullName,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(alumniProfiles, eq(alumniProfiles.userId, users.id))
    .where(where)
    .orderBy(desc(posts.createdAt));

  const ids = rows.map((post) => post.id);
  const imageCounts = ids.length
    ? await db
        .select({ postId: postImages.postId, value: count() })
        .from(postImages)
        .where(inArray(postImages.postId, ids))
        .groupBy(postImages.postId)
    : [];
  const countMap = new Map(imageCounts.map((item) => [item.postId, item.value]));

  return rows.map((post) => ({
    ...post,
    author: {
      username: post.username,
      alumniProfile: post.fullName ? { fullName: post.fullName } : null,
    },
    images: Array.from({ length: countMap.get(post.id) ?? 0 }),
  }));
}

export async function getAdminGallery({ q, status }: { q?: string; status?: StatusFilter | string }) {
  const db = await getCloudflareDb();
  const where = and(
    ...compactFilters([
      statusWhere(galleryPhotos, status ?? ""),
      q ? like(alumniProfiles.fullName, contains(q)) : undefined,
    ]),
  );

  const rows = await db
    .select({
      id: galleryPhotos.id,
      imageUrl: galleryPhotos.imageUrl,
      caption: galleryPhotos.caption,
      isHidden: galleryPhotos.isHidden,
      createdAt: galleryPhotos.createdAt,
      username: users.username,
      fullName: alumniProfiles.fullName,
    })
    .from(galleryPhotos)
    .innerJoin(users, eq(galleryPhotos.uploadedById, users.id))
    .leftJoin(alumniProfiles, eq(alumniProfiles.userId, users.id))
    .where(where)
    .orderBy(desc(galleryPhotos.createdAt));

  return rows.map((photo) => ({
    ...photo,
    uploadedBy: {
      username: photo.username,
      alumniProfile: photo.fullName ? { fullName: photo.fullName } : null,
    },
  }));
}

export async function getAdminLogs({ date, limit, offset }: { date?: string; limit: number; offset: number }) {
  const db = await getCloudflareDb();
  const start = date ? new Date(`${date}T00:00:00`) : undefined;
  const end = date ? new Date(`${date}T23:59:59`) : undefined;
  const where = start && end ? and(gte(adminLogs.createdAt, start), lt(adminLogs.createdAt, end)) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: adminLogs.id,
        action: adminLogs.action,
        targetType: adminLogs.targetType,
        targetId: adminLogs.targetId,
        description: adminLogs.description,
        createdAt: adminLogs.createdAt,
        adminUsername: users.username,
      })
      .from(adminLogs)
      .innerJoin(users, eq(adminLogs.adminId, users.id))
      .where(where)
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(adminLogs).where(where),
  ]);

  return {
    logs: rows.map((log) => ({
      ...log,
      admin: { username: log.adminUsername },
    })),
    total: totalRows[0]?.value ?? 0,
  };
}

export async function getAdminDashboardData() {
  const db = await getCloudflareDb();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const startSeconds = Math.floor(start.getTime() / 1000);

  const [
    totals,
    majorGroup,
    collegeGroup,
    domicileGroup,
    originGroup,
    recentUsers,
    monthlyGroup,
  ] = await Promise.all([
    db.all<{
      totalAlumni: number;
      pending: number;
      approved: number;
      disabled: number;
      postPublic: number;
      postHidden: number;
      galleryPublic: number;
      galleryHidden: number;
    }>(sql`
      select
        (select count(*) from users where role = 'ALUMNI') as totalAlumni,
        (select count(*) from users where role = 'ALUMNI' and status = 'PENDING') as pending,
        (select count(*) from users where role = 'ALUMNI' and status = 'APPROVED') as approved,
        (select count(*) from users where role = 'ALUMNI' and status = 'DISABLED') as disabled,
        (select count(*) from posts where is_hidden = 0) as postPublic,
        (select count(*) from posts where is_hidden = 1) as postHidden,
        (select count(*) from gallery_photos where is_hidden = 0) as galleryPublic,
        (select count(*) from gallery_photos where is_hidden = 1) as galleryHidden
    `),
    db
      .select({ name: alumniProfiles.highSchoolMajor, value: count() })
      .from(alumniProfiles)
      .innerJoin(users, eq(alumniProfiles.userId, users.id))
      .where(eq(users.role, "ALUMNI"))
      .groupBy(alumniProfiles.highSchoolMajor),
    db
      .select({ name: alumniProfiles.collegeMajor, value: count() })
      .from(alumniProfiles)
      .innerJoin(users, eq(alumniProfiles.userId, users.id))
      .where(eq(users.role, "ALUMNI"))
      .groupBy(alumniProfiles.collegeMajor)
      .orderBy(desc(count()))
      .limit(10),
    db
      .select({ name: alumniProfiles.domicileProvince, value: count() })
      .from(alumniProfiles)
      .innerJoin(users, eq(alumniProfiles.userId, users.id))
      .where(and(eq(users.role, "ALUMNI"), isNotNull(alumniProfiles.domicileProvince)))
      .groupBy(alumniProfiles.domicileProvince)
      .orderBy(desc(count()))
      .limit(10),
    db
      .select({ name: alumniProfiles.originProvince, value: count() })
      .from(alumniProfiles)
      .innerJoin(users, eq(alumniProfiles.userId, users.id))
      .where(and(eq(users.role, "ALUMNI"), isNotNull(alumniProfiles.originProvince)))
      .groupBy(alumniProfiles.originProvince)
      .orderBy(desc(count()))
      .limit(10),
    db
      .select({ user: users, alumniProfile: alumniProfiles })
      .from(users)
      .leftJoin(alumniProfiles, eq(alumniProfiles.userId, users.id))
      .where(eq(users.role, "ALUMNI"))
      .orderBy(desc(users.createdAt))
      .limit(5),
    db
      .all<{ key: string; value: number }>(sql`
        select strftime('%Y-%m', datetime(created_at, 'unixepoch')) as key, count(*) as value
        from users
        where role = 'ALUMNI' and created_at >= ${startSeconds}
        group by key
      `),
  ]);
  const counts = totals[0];

  return {
    total: counts?.totalAlumni ?? 0,
    pending: counts?.pending ?? 0,
    approved: counts?.approved ?? 0,
    disabled: counts?.disabled ?? 0,
    postPublic: counts?.postPublic ?? 0,
    postHidden: counts?.postHidden ?? 0,
    galleryPublic: counts?.galleryPublic ?? 0,
    galleryHidden: counts?.galleryHidden ?? 0,
    majorGroup,
    collegeGroup,
    domicileGroup,
    originGroup,
    recentUsers: recentUsers.map((row) => ({ ...row.user, alumniProfile: row.alumniProfile })),
    monthlyGroup,
    now,
  };
}

export async function rawCount(tableName: string) {
  const db = await getCloudflareDb();
  const rows = await db.all<{ value: number }>(sql.raw(`select count(*) as value from ${tableName}`));
  return rows[0]?.value ?? 0;
}
