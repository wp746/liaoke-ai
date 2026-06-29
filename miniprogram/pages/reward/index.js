const app = getApp();

Page({
  data: {
    member: {},
    rewards: []
  },

  onShow() {
    app.bootstrap().then(({ member, rewards }) => {
      this.setData({
        member,
        rewards
      });
    });
  },

  handleReward(event) {
    const id = event.currentTarget.dataset.id;
    if (id === "poster") {
      wx.switchTab({ url: "/pages/ai-play/index" });
      return;
    }
    if (id === "coupon") {
      wx.switchTab({ url: "/pages/coupon/list" });
      return;
    }
    wx.showToast({ title: "已记录奖励动作", icon: "success" });
  }
});
