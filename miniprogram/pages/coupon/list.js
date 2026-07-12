const app = getApp();

Page({
  data: {
    activeStatus: "unused",
    coupons: [],
    filteredCoupons: [],
    selectedCoupon: null,
    reduceMotion: false
  },

  onShow() {
    this.setData({ reduceMotion: app.globalData.reduceMotion });
    app.bootstrap().then(() => this.refreshCoupons());
  },

  refreshCoupons() {
    app.refreshCoupons(this.data.activeStatus).then((filteredCoupons) => {
      this.setData({
        coupons: app.globalData.coupons,
        filteredCoupons
      });
    }).catch((error) => {
      wx.showToast({ title: error.msg || "券列表加载失败", icon: "none" });
    });
  },

  switchStatus(event) {
    this.setData({ activeStatus: event.currentTarget.dataset.status }, () => this.refreshCoupons());
  },

  showCode(event) {
    this.setData({ selectedCoupon: event.detail });
  },

  noop() {},

  closeCode() {
    this.setData({ selectedCoupon: null });
  }
});
