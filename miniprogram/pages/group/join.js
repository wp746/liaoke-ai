const app = getApp();
const api = require("../../utils/api");

Page({
  data: {
    store: {},
    copied: false
  },

  onLoad(query) {
    app.bootstrap().then(({ store, member }) => {
      this.setData({ store });
      return api.trackEvent({
        event_type: "group_join_page_show",
        page: "group_join",
        from: query.from || "unknown",
        store_id: store.id,
        member_id: member.id
      });
    }).catch(() => {});
  },

  copyGroupLink() {
    const store = this.data.store || {};
    const link = store.groupChatUrl || "https://example.com/group-guide";
    wx.setClipboardData({
      data: link,
      success: () => {
        this.setData({ copied: true });
        wx.showToast({ title: "入群链接已复制", icon: "success" });
      }
    });
  },

  previewQr() {
    const image = this.data.store.groupQrImage || "/assets/brand/png/liaoke-mark.png";
    wx.previewImage({
      urls: [image],
      current: image
    });
  },

  backHome() {
    wx.switchTab({ url: "/pages/index/index" });
  }
});
