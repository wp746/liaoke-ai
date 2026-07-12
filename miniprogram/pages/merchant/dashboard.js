const app = getApp();
const api = require("../../utils/api");

Page({
  data: {
    stats: {},
    statCards: [],
    pageState: "loading",
    errorMessage: "",
    reduceMotion: false
  },

  onLoad() {
    this.setData({ reduceMotion: app.globalData.reduceMotion });
    this.loadStats();
  },

  loadStats() {
    this.setData({ pageState: "loading", errorMessage: "" });
    api.getDailyStats({ store_id: app.globalData.store.id || "STORE001" }).then((stats) => {
      const statCards = [
        { label: "扫码人数", value: stats.scanCount, kind: "store" },
        { label: "发券数量", value: stats.issuedCount, kind: "dish" },
        { label: "核销数量", value: stats.verifiedCount, kind: "balance" },
        { label: "AI 使用人数", value: stats.aiUsers, kind: "ai" },
        { label: "海报生成", value: stats.posters, kind: "referral" },
        { label: "入群点击", value: stats.groupClicks, kind: "group" }
      ];
      this.setData({
        stats,
        statCards,
        pageState: statCards.length ? "ready" : "empty"
      });
    }).catch((error) => {
      this.setData({
        stats: {},
        statCards: [],
        pageState: "error",
        errorMessage: error.msg || "数据加载失败"
      });
      wx.showToast({ title: error.msg || "数据加载失败", icon: "none" });
    });
  },

  goVerify() {
    wx.navigateTo({ url: "/pages/merchant/verify" });
  }
});
