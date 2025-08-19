const { db } = require("../../../db");

module.exports = async () => {
  const rows = await db("group_admins")
    .join("admin", "group_admins.admin_id", "admin.id")
    .join("groups", "group_admins.group_id", "groups.id")
    .where("admin.is_deleted", false)
    .select(
      "group_admins.id as id",
      "admin.id as admin_id",
      "admin.first_name",
      "admin.last_name",
      "admin.username",
      "admin.phone_number",
      "groups.id as group_id",
      "groups.name as group_name",
      "groups.description as group_description"
    );

  return rows;
};
