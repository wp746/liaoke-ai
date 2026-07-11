import React from "react";
import { canAdmin } from "../permissions.js";
import { AdminFrame } from "../components/AdminFrame.jsx";
import { AdminLoginPage, AdminOverviewPage } from "./OverviewPages.jsx";
import { StoreDetailPage, StoreEditorPage, StoresPage, TableCodesPage } from "./StorePages.jsx";
import "../styles/admin.css";

const pageByRoute = {
  "admin-login": AdminLoginPage,
  "admin-overview": AdminOverviewPage,
  stores: StoresPage,
  "store-editor": StoreEditorPage,
  "store-detail": StoreDetailPage,
  "table-codes": TableCodesPage,
};

export function AdminApp({ routeId, role, state, dispatch, onNavigate }) {
  const Page = pageByRoute[routeId] ?? AdminOverviewPage;
  const permissions = {
    canRead: canAdmin(role, "platform:read"),
    canWrite: canAdmin(role, "store:update"),
  };

  return (
    <AdminFrame role={role} activeRoute={routeId} onNavigate={onNavigate}>
      <Page
        role={role}
        state={state}
        dispatch={dispatch}
        onNavigate={onNavigate}
        permissions={permissions}
      />
    </AdminFrame>
  );
}

export default AdminApp;
