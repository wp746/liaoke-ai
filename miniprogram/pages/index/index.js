const app = getApp();
const api = require("../../utils/api");

Page({
  data: {
    store: {},
    member: {},
    todayCoupon: null,
    reduceMotion: false
  },

  onShow() {
    app.bootstrap().then(({ store, member, coupons }) => {
      this.setData({
        store,
        member,
        todayCoupon: coupons.find((item) => item.type === "base" && item.status === "unused"),
        reduceMotion: app.globalData.reduceMotion
      });
    });
  },

  handleIssueCoupon() {
    wx.showLoading({ title: "发券中" });
    app.issueBaseCoupon().then((coupon) => {
      this.setData({ todayCoupon: coupon });
      wx.showToast({ title: "吃肉券已入账", icon: "success" });
    }).catch((error) => {
      wx.showToast({ title: error.msg || "发券失败", icon: "none" });
    }).finally(() => {
      wx.hideLoading();
    });
  },

  goCoupon() {
    wx.switchTab({ url: "/pages/coupon/list" });
  },

  goAiPlay() {
    wx.switchTab({ url: "/pages/ai-play/index" });
  },

  goReward() {
    wx.switchTab({ url: "/pages/reward/index" });
  },

  joinMemberGroup() {
    const store = this.data.store || {};
    api.trackEvent({
      event_type: "group_join_click",
      page: "home",
      button: "join_group",
      store_id: store.id,
      member_id: this.data.member.id
    }).catch(() => {});

    wx.navigateTo({
      url: `/pages/group/join?from=home&storeId=${encodeURIComponent(store.id || "")}`
    });
  }
});
