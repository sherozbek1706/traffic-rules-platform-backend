const hasRole = require("../shared/auth/_hasRole");
const isLoggedIn = require("../shared/auth/_isLoggedIn");

const mSuperAdmin = [isLoggedIn, hasRole(["super_admin"])];
const mAdmin = [isLoggedIn, hasRole(["super_admin", "admin"])];
const mStudent = [isLoggedIn, hasRole(["student"])];

module.exports = { mSuperAdmin, mAdmin, mStudent };
