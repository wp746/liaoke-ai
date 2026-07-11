import React, { useReducer, useState } from "react";
import { canAdmin } from "../permissions.js";
import { AdminFrame } from "../components/AdminFrame.jsx";
import { AdminLoginPage, AdminOverviewPage } from "./OverviewPages.jsx";
import { StoreDetailPage, StoreEditorPage, StoresPage, TableCodesPage } from "./StorePages.jsx";
import "../styles/admin.css";

const initialStores = [
  { id: "STORE001", name: "牛里牛气潮汕牛肉火锅", city: "广州·天河", type: "潮汕牛肉火锅", tableIp: "燎小星·吃肉星球", averageSpend: "126", plan: "pro", status: "active", logo: "liaoke-nxnq-logo.svg", brandColor: "#FF5A1F", members: "12,680", risk: "2 项", visits: "8,924", codeCount: "48", costRate: "8.6%" },
  { id: "STORE018", name: "薪火小馆·珠江新城", city: "广州·天河", type: "中式正餐", tableIp: "燎小星·小馆系列", averageSpend: "92", plan: "basic", status: "active", logo: "xinhua-logo.svg", brandColor: "#E9672D", members: "4,208", risk: "无", visits: "3,106", codeCount: "26", costRate: "7.2%" },
  { id: "STORE027", name: "岭南清汤牛肉", city: "佛山·禅城", type: "潮汕牛肉火锅", tableIp: "燎小星·清汤系列", averageSpend: "108", plan: "pro", status: "paused", logo: "lingnan-logo.svg", brandColor: "#C95F34", members: "7,916", risk: "1 项", visits: "4,782", codeCount: "32", costRate: "9.1%" },
];

const initialCodes = [
  { table: "A12", id: "NXNQ-A12-0711", status: "active", scans: 286, storeId: "STORE001" },
  { table: "A13", id: "NXNQ-A13-0711", status: "active", scans: 194, storeId: "STORE001" },
  { table: "A14", id: "NXNQ-A14-0711", status: "active", scans: 173, storeId: "STORE001" },
];

function createAdminState() {
  return { stores: initialStores, selectedStoreId: "STORE001", codes: initialCodes, nextStoreSequence: 28, nextCodeSequence: 1, feedback: null };
}

function adminReducer(state, event) {
  if (event.type === "SELECT_STORE") return { ...state, selectedStoreId: event.storeId, feedback: null };
  if (event.actorRole !== "super_admin") return state;

  switch (event.type) {
    case "SAVE_STORE": {
      if (event.store.id) {
        return { ...state, selectedStoreId: event.store.id, stores: state.stores.map((store) => store.id === event.store.id ? { ...store, ...event.store } : store), feedback: "门店资料已保存到当前原型会话。" };
      }
      const id = `STORE${String(state.nextStoreSequence).padStart(3, "0")}`;
      const store = { ...event.store, id, city: event.store.city || "深圳·福田", members: "0", risk: "无", visits: "0", codeCount: "0", costRate: "0%" };
      return { ...state, stores: [...state.stores, store], selectedStoreId: id, nextStoreSequence: state.nextStoreSequence + 1, feedback: "门店资料已保存到当前原型会话。" };
    }
    case "GENERATE_CODES": {
      const existing = state.codes.filter((code) => code.storeId === event.storeId);
      const highestTable = existing.reduce((highest, code) => Math.max(highest, Number(code.table.replace(/\D/g, "")) || 0), 0);
      const additions = Array.from({ length: event.count }, (_, index) => {
        const table = `A${highestTable + index + 1}`;
        const sequence = state.nextCodeSequence + index;
        return { table, id: `NXNQ-${table}-NEW-${String(sequence).padStart(3, "0")}`, status: "active", scans: 0, storeId: event.storeId };
      });
      return { ...state, codes: [...state.codes, ...additions], nextCodeSequence: state.nextCodeSequence + event.count };
    }
    case "DEACTIVATE_CODE":
      return { ...state, codes: state.codes.map((code) => code.id === event.codeId ? { ...code, status: "disabled" } : code) };
    default:
      return state;
  }
}

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
