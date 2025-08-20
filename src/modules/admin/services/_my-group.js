// // services/groups/myGroupsWithStudents.js (masalan)
// // Siz bergan skeletga mos yozuv:

// const { db } = require("../../../db");

// /**
//  * Auth bo'lgan foydalanuvchining guruhlari va har bir guruhdagi studentlar ro'yxati.
//  *
//  * Kirish:
//  *   { user: { id, role } }
//  *
//  * Chiqish:
//  *   {
//  *     groups: [
//  *       {
//  *         group_id,
//  *         group_name,
//  *         group_description,
//  *         students: [
//  *           { id, first_name, last_name, username, phone_number, created_at }
//  *         ]
//  *       },
//  *       ...
//  *     ],
//  *     total_groups: <number>,
//  *     total_students: <number>
//  *   }
//  *
//  * Qoidalar:
//  *  - super_admin: barcha guruhlarni ko'radi
//  *  - admin: faqat group_admins jadvali orqali biriktirilgan guruhlarni ko'radi
//  *  - Xavfsizlik: parol maydonlari qaytarilmaydi
//  */
// module.exports = async ({ user }) => {
//   const { id: userId, role } = user || {};

//   // 1) Minimal tekshiruvlar
//   if (!userId || !role) {
//     const err = new Error("Unauthorized: user yoki role yo‘q.");
//     err.status = 401;
//     throw err;
//   }
//   if (!["admin", "super_admin"].includes(role)) {
//     const err = new Error("Forbidden: ruxsatsiz role.");
//     err.status = 403;
//     throw err;
//   }

//   // Transaction shart emas, lekin bir xil snapshotda o‘qish uchun foydali bo‘lishi mumkin
//   const trx = await db.transaction();

//   try {
//     // 2) Guruhlarni rolga ko‘ra olish
//     // super_admin -> hammasi, admin -> group_admins bo'yicha o'ziniki
//     let groupsQuery = db("groups as g")
//       .transacting(trx)
//       .select("g.id", "g.name", "g.description")
//       .orderBy("g.created_at", "desc");

//     if (role === "admin") {
//       groupsQuery = groupsQuery
//         .join("group_admins as ga", "ga.group_id", "g.id")
//         .where("ga.admin_id", userId)
//         .distinct(); // ehtiyot chorasi: dublikatlarga yo‘l qo‘ymaslik
//     }

//     const groups = await groupsQuery;

//     // Agar guruhi bo'lmasa ham toza chiqish:
//     if (groups.length === 0) {
//       await trx.commit();
//       return { groups: [], total_groups: 0, total_students: 0 };
//     }

//     // 3) Shu guruhlarga tegishli studentlarni bitta so‘rovda olish
//     const groupIds = groups.map((g) => g.id);

//     const students = await db("students as s")
//       .transacting(trx)
//       .select(
//         "s.id",
//         "s.first_name",
//         "s.last_name",
//         "s.username",
//         "s.phone_number",
//         "s.group_id",
//         "s.created_at"
//       )
//       .whereIn("s.group_id", groupIds)
//       .orderBy("s.created_at", "desc");

//     await trx.commit();

//     // 4) JS tarafida guruhlab chiqish (DB-agnostik yechim)
//     const byGroupId = new Map(
//       groups.map((g) => [
//         g.id,
//         {
//           group_id: g.id,
//           group_name: g.name,
//           group_description: g.description,
//           students: [],
//         },
//       ])
//     );

//     for (const s of students) {
//       const bucket = byGroupId.get(s.group_id);
//       if (bucket) {
//         bucket.students.push({
//           id: s.id,
//           first_name: s.first_name,
//           last_name: s.last_name,
//           username: s.username,
//           phone_number: s.phone_number,
//           created_at: s.created_at,
//         });
//       }
//     }

//     const result = Array.from(byGroupId.values());
//     return {
//       groups: result,
//       total_groups: result.length,
//       total_students: students.length,
//     };
//   } catch (e) {
//     // xato bo‘lsa tranzaksiyani orqaga qaytaramiz
//     try {
//       await trx.rollback();
//     } catch {}
//     // tashqariga ma’noli xabar bilan uzatamiz
//     const err = new Error(
//       process.env.NODE_ENV === "production"
//         ? "Internal error"
//         : `myGroupsWithStudents error: ${e.message}`
//     );
//     err.status = 500;
//     throw err;
//   }
// };

// services/groups/myGroupsWithStudents.js

const { db } = require("../../../db");

/**
 * Auth bo'lgan foydalanuvchining guruhlari va har bir guruhdagi studentlar ro'yxati.
 */
module.exports = async ({ user }) => {
  const { id: userId, role } = user || {};

  if (!userId || !role) {
    const err = new Error("Unauthorized: user yoki role yo‘q.");
    err.status = 401;
    throw err;
  }
  if (!["admin", "super_admin"].includes(role)) {
    const err = new Error("Forbidden: ruxsatsiz role.");
    err.status = 403;
    throw err;
  }

  const trx = await db.transaction();

  try {
    let groupsQuery = db("groups as g")
      .transacting(trx)
      .select("g.id", "g.name", "g.description", "g.created_at") // ⚡ created_at qo‘shildi
      .orderBy("g.created_at", "desc");

    if (role === "admin") {
      groupsQuery = groupsQuery
        .join("group_admins as ga", "ga.group_id", "g.id")
        .where("ga.admin_id", userId)
        .distinct(["g.id", "g.name", "g.description", "g.created_at"]); // ⚡ DISTINCT explicit
    }

    const groups = await groupsQuery;

    if (groups.length === 0) {
      await trx.commit();
      return { groups: [], total_groups: 0, total_students: 0 };
    }

    const groupIds = groups.map((g) => g.id);

    const students = await db("students as s")
      .transacting(trx)
      .select(
        "s.id",
        "s.first_name",
        "s.last_name",
        "s.username",
        "s.phone_number",
        "s.group_id",
        "s.created_at"
      )
      .whereIn("s.group_id", groupIds)
      .orderBy("s.created_at", "desc");

    await trx.commit();

    // Guruhlash
    const byGroupId = new Map(
      groups.map((g) => [
        g.id,
        {
          group_id: g.id,
          group_name: g.name,
          group_description: g.description,
          students: [],
        },
      ])
    );

    for (const s of students) {
      const bucket = byGroupId.get(s.group_id);
      if (bucket) {
        bucket.students.push({
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          username: s.username,
          phone_number: s.phone_number,
          created_at: s.created_at,
        });
      }
    }

    const result = Array.from(byGroupId.values());

    return {
      groups: result,
      total_groups: result.length,
      total_students: students.length,
    };
  } catch (e) {
    try {
      await trx.rollback();
    } catch {}
    const err = new Error(
      process.env.NODE_ENV === "production"
        ? "Internal error"
        : `myGroupsWithStudents error: ${e.message}`
    );
    err.status = 500;
    throw err;
  }
};
