import React, { useReducer, useState } from "react";
import { canAdmin } from "../permissions.js";
import { AdminFrame } from "../components/AdminFrame.jsx";
import { AdminLoginPage, AdminOverviewPage } from "./OverviewPages.jsx";
import { StoreDetailPage, StoreEditorPage, StoresPage, TableCodesPage } from "./StorePages.jsx";
import { SYSTEM_PAGE_BY_ROUTE } from "./SystemPages.jsx";
import { adminReducer, createAdminState } from "./adminState.js";
import "../styles/admin.css";

const pageByRoute = {
  "admin-login": AdminLoginPage,
  "admin-overview": AdminOverviewPage,
  stores: StoresPage,
  "store-editor": StoreEditorPage,
  "store-detail": StoreDetailPage,
  "table-codes": TableCodesPage,
  ...SYSTEM_PAGE_BY_ROUTE,
};

export function AdminApp({ routeId, role, state, dispatch, onNavigate }) {
  const Page = pageByRoute[routeId] ?? AdminOverviewPage;
  const [adminState, adminDispatch] = useReducer(adminReducer, undefined, createAdminState);
  const [globalSearch, setGlobalSearch] = useState("");
  const permissions = { canRead: canAdmin(role, "platform:read"), canWrite: canAdmin(role, "store:update") };
  const selectedStore = adminState.stores.find((store) => store.id === adminState.selectedStoreId) ?? null;

  const dispatchAdmin = (event) => adminDispatch({ ...event, actorRole: role });
  const openStore = (storeId, destination = "store-detail") => {
    adminDispatch({ type: "SELECT_STORE", storeId });
    onNavigate(destination);
  };
  const createStore = () => {
    adminDispatch({ type: "SELECT_STORE", storeId: null });
    onNavigate("store-editor");
  };

  return (
    <AdminFrame
      role={role}
      activeRoute={routeId}
      onNavigate={onNavigate}
      searchValue={globalSearch}
      onSearchChange={setGlobalSearch}
      searchStores={adminState.stores}
      onOpenSearchResult={(storeId) => { setGlobalSearch(""); openStore(storeId); }}
    >
      <Page
        key={`${routeId}-${adminState.selectedStoreId ?? "new"}`}
        role={role}
        state={state}
        dispatch={dispatch}
        onNavigate={onNavigate}
        permissions={permissions}
        adminState={adminState}
        selectedStore={selectedStore}
        dispatchAdmin={dispatchAdmin}
        onOpenStore={openStore}
        onCreateStore={createStore}
      />
    </AdminFrame>
  );
}

export default AdminApp;
