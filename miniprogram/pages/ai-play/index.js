const { styleOptions } = require("../../utils/mock");
const { uploadImage } = require("../../utils/upload");
const { showApiError, withLoading } = require("../../utils/ui");

Page({
  data: {
    imagePath: "",
    imageUrl: "",
    uploadStatus: "",
    feeling: "吊龙太嫩了，朋友聚餐很舒服。",
    styles: styleOptions,
    activeStyle: "高级日常",
    presets: ["今天肉很新鲜", "这家性价比可以", "朋友聚餐很舒服"],
    reduceMotion: false
  },

  onShow() {
    this.setData({ reduceMotion: getApp().globalData.reduceMotion });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      success: (res) => {
        const file = res.tempFiles && res.tempFiles[0];
        const imagePath = file ? file.tempFilePath : "";
        this.setData({ imagePath, uploadStatus: imagePath ? "uploading" : "" });
        if (!imagePath) {
          return;
        }
        withLoading("上传中", () => uploadImage(imagePath))
          .then((result) => {
            this.setData({
              imageUrl: result.file_url,
              uploadStatus: "done"
            });
            wx.showToast({ title: "图片已就绪", icon: "success" });
          })
          .catch((error) => {
            this.setData({ uploadStatus: "failed" });
            showApiError(error, "图片上传失败");
          });
      },
      fail: () => {
        wx.showToast({ title: "已保留无图创作", icon: "none" });
      }
    });
  },

  updateFeeling(event) {
    this.setData({ feeling: event.detail.value });
  },

  usePreset(event) {
    this.setData({ feeling: event.currentTarget.dataset.text });
  },

  chooseStyle(event) {
    this.setData({ activeStyle: event.currentTarget.dataset.style });
  },

  generate() {
    const feeling = this.data.feeling || "今天肉很新鲜";
    const url = `/pages/ai-result/index?style=${encodeURIComponent(this.data.activeStyle)}&feeling=${encodeURIComponent(feeling)}&imageUrl=${encodeURIComponent(this.data.imageUrl)}`;
    wx.navigateTo({ url });
  }
});
