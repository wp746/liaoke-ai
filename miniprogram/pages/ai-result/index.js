const app = getApp();
const api = require("../../utils/api");

Page({
  data: {
    style: "高级日常",
    feeling: "",
    imageUrl: "",
    options: [],
    selectedId: "copy_1"
  },

  onLoad(query) {
    this.setData({
      style: decodeURIComponent(query.style || "高级日常"),
      feeling: decodeURIComponent(query.feeling || ""),
      imageUrl: decodeURIComponent(query.imageUrl || "")
    }, () => this.loadCopies());
  },

  loadCopies() {
    wx.showLoading({ title: "生成中" });
    api.generateAiText({
      store_id: app.globalData.store.id || "STORE001",
      style: this.data.style,
      feeling: this.data.feeling,
      image_url: this.data.imageUrl
    }).then((data) => {
      const options = data.list || [];
      this.setData({
        options,
        selectedId: options[0]?.id || ""
      });
    }).catch((error) => {
      wx.showToast({ title: error.msg || "文案生成失败", icon: "none" });
    }).finally(() => {
      wx.hideLoading();
    });
  },

  selectCopy(event) {
    this.setData({ selectedId: event.currentTarget.dataset.id });
  },

  generatePoster() {
    const selected = this.data.options.find((item) => item.id === this.data.selectedId) || this.data.options[0];
    wx.showLoading({ title: "生成海报" });
    api.generatePoster({
      store_id: app.globalData.store.id || "STORE001",
      member_id: app.globalData.member.id,
      style: this.data.style,
      feeling: this.data.feeling,
      copy: selected.content,
      title: selected.title,
      image_url: this.data.imageUrl
    }).then((poster) => {
      app.globalData.selectedPoster = poster;
      wx.navigateTo({ url: "/pages/poster/preview" });
    }).catch((error) => {
      wx.showToast({ title: error.msg || "海报生成失败", icon: "none" });
    }).finally(() => {
      wx.hideLoading();
    });
  }
});
