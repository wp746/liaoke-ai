const app = getApp();

Page({
  data: {
    member: {},
    store: {}
  },

  onShow() {
    app.bootstrap().then(({ member, store }) => {
      this.setData({
        member,
        store
      });
    });
  },

  goMerchantVerify() {
    wx.navigateTo({ url: "/pages/merchant/verify" });
  },

  goMerchantDashboard() {
    wx.navigateTo({ url: "/pages/merchant/dashboard" });
  },

  goMemberGroup() {
    wx.navigateTo({ url: "/pages/group/join?from=me" });
  }
});
