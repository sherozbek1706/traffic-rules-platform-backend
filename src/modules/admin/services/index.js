const services = {
  add: require("./_add"),
  login: require("./_login"),
  list: require("./_list"),
  remove: require("./_remove"),
  edit: require("./_edit"),
  profile: require("./_profile"),
  addAdminToGroup: require("./_add-admin-to-group"),
  listGroupAdmins: require("./_list-group-admins"),
  removeAdminGroups: require("./_remove-admin-groups"),
  myGroup: require("./_my-group"),
};

module.exports = services;
