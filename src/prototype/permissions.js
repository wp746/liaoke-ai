const merchantNavigation = {
  owner: ["merchant-dashboard", "verify-hub", "members", "activities", "merchant-export"],
  manager: ["merchant-dashboard", "verify-hub", "members", "verify-history"],
  staff: ["verify-hub", "verify-history", "merchant-export"],
};

const merchantActions = {
  owner: new Set(["verify", "members:read", "activity:write", "points:write", "employee:write", "store:update", "export"]),
  manager: new Set(["verify", "members:read"]),
  staff: new Set(["verify"]),
};

export const merchantTabs = (role) => merchantNavigation[role].map((id) => ({ id }));
export const canMerchant = (role, action) => merchantActions[role]?.has(action) ?? false;
export const canAdmin = (role, action) => role === "super_admin" || (role === "platform_admin" && action.endsWith(":read"));
