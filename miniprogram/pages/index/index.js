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
      const store = this.data.store || {};
      if (!store.groupEnabled) {
        wx.showToast({ title: "吃肉券已入账", icon: "success" });
        return;
      }
      wx.showModal({
        title: "福利已到账",
        content: `${store.groupJoinGuide}\n入群完全自愿，不影响已领权益。`,
        confirmText: "去入群",
        cancelText: "看权益",
        success: ({ confirm }) => {
          if (confirm) {
            this.openMemberGroup("coupon_claim");
          } else {
            this.goCoupon();
          }
        }
      });
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
    this.openMemberGroup("home");
  },

  openMemberGroup(from) {
    const store = this.data.store || {};
    api.trackEvent({
      event_type: "group_join_click",
      page: from,
      button: "join_group",
      store_id: store.id,
      member_id: this.data.member.id
    }).catch(() => {});

    wx.navigateTo({
      url: `/pages/group/join?from=${from}&storeId=${encodeURIComponent(store.id || "")}`
    });
  }
});
