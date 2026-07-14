const api = require("./utils/api");
const { getWxLoginCode, parseLaunchScene } = require("./utils/auth");
const { getState } = require("./utils/mock-service");

function normalizeStore(store = {}) {
  const normalized = {
    ...store,
    id: store.id || store.store_id || "STORE001",
    name: store.name || store.store_name || "牛里牛气潮汕牛肉火锅",
    tableName: store.tableName || store.table_name || "A12 桌",
    tableIpName: store.tableIpName || store.table_ip_name || "AI 肉小签",
    groupChatUrl: store.groupChatUrl || store.group_chat_url || "",
    groupChatName: store.groupChatName || store.group_chat_name || "牛里牛气会员福利群",
    groupJoinGuide: store.groupJoinGuide || store.group_join_guide || "进群领隐藏福利、生日券和新品试吃提醒。",
    groupQrImage: store.groupQrImage || store.group_qr_image || "/assets/brand/png/liaoke-mark.png"
  };
  return normalized;
}

App({
  globalData: {
    store: {},
    member: {},
    coupons: [],
    rewards: [],
    launchScene: {},
    selectedPoster: null,
    reduceMotion: false
  },

  onLaunch(options) {
    this.globalData.reduceMotion = wx.getStorageSync("liaoke_reduce_motion") === true;
    this.bootstrap(options);
  },

  bootstrap(options = {}) {
    if (this.bootstrapPromise) {
      return this.bootstrapPromise;
    }

    const launchScene = parseLaunchScene(options);
    this.globalData.launchScene = launchScene;

    this.bootstrapPromise = getWxLoginCode().then((code) => api.login({
      code,
      store_id: launchScene.storeId,
      table_id: launchScene.tableId,
      scene: launchScene.scene
    })).then((data) => {
      const fallback = getState();
      this.globalData.store = normalizeStore(data.store || fallback.store);
      this.globalData.member = data.member || fallback.member;
      this.globalData.coupons = fallback.coupons;
      this.globalData.rewards = fallback.rewards;
      return this.globalData;
    }).catch(() => {
      const fallback = getState();
      this.globalData.store = normalizeStore(fallback.store);
      this.globalData.member = fallback.member;
      this.globalData.coupons = fallback.coupons;
      this.globalData.rewards = fallback.rewards;
      return this.globalData;
    });

    return this.bootstrapPromise;
  },

  refreshCoupons(status = "unused") {
    return api.listCoupons({
      member_id: this.globalData.member.id,
      status,
      page: 1,
      page_size: 20
    }).then((data) => {
      const others = this.globalData.coupons.filter((item) => item.status !== status);
      this.globalData.coupons = [...data.list, ...others];
      return data.list;
    });
  },

  issueBaseCoupon() {
    return api.issueCoupon({
      member_id: this.globalData.member.id,
      store_id: this.globalData.store.id,
      coupon_type: "base"
    }).then((coupon) => {
      const withoutDuplicate = this.globalData.coupons.filter((item) => item.id !== coupon.id);
      this.globalData.coupons = [coupon, ...withoutDuplicate];
      return coupon;
    });
  }
});
