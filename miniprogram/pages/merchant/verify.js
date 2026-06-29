const app = getApp();
const api = require("../../utils/api");

Page({
  data: {
    code: "8827639401",
    amount: "256.00",
    coupon: null,
    discount: "38.40",
    payable: "217.60"
  },

  onLoad() {
    this.preview();
  },

  updateCode(event) {
    this.setData({ code: event.detail.value });
  },

  updateAmount(event) {
    this.setData({ amount: event.detail.value }, () => this.recalc());
  },

  preview() {
    api.previewVerify(this.data.code).then((coupon) => {
      this.setData({ coupon }, () => this.recalc());
    }).catch((error) => {
      this.setData({ coupon: null });
      wx.showToast({ title: error.msg || "未找到券码", icon: "none" });
    });
  },

  recalc() {
    const amount = Number(this.data.amount) || 0;
    const discount = this.data.coupon ? amount * 0.15 : 0;
    const payable = Math.max(amount - discount, 0);
    this.setData({
      discount: discount.toFixed(2),
      payable: payable.toFixed(2)
    });
  },

  verify() {
    if (!this.data.coupon) {
      wx.showToast({ title: "未找到券码", icon: "none" });
      return;
    }
    wx.showModal({
      title: "确认核销",
      content: `${this.data.coupon.title}，应收 ¥${this.data.payable}`,
      success: (res) => {
        if (res.confirm) {
          api.verifyCoupon({
            coupon_code: this.data.code,
            store_id: app.globalData.store.id,
            amount: Number(this.data.amount) || 0
          }).then(() => {
            wx.showToast({ title: "核销成功", icon: "success" });
            this.preview();
          }).catch((error) => {
            wx.showToast({ title: error.msg || "核销失败", icon: "none" });
          });
        }
      }
    });
  }
});
