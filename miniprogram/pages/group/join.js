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
    const link = store.groupChatUrl;
    if (!link) {
      wx.showToast({ title: "请长按二维码或联系群助手", icon: "none" });
      return;
    }
    wx.setClipboardData({
      data: link,
      success: () => {
        this.setData({ copied: true });
        this.track("group_join_link_copy");
        wx.showToast({ title: "入群链接已复制", icon: "success" });
      }
    });
  },

  previewQr() {
    const image = this.data.store.groupQrImage || "/assets/brand/png/group-guide-demo-qr.png";
    this.track("group_join_qr_preview");
    wx.previewImage({
      urls: [image],
      current: image
    });
  },

  contactAssistant() {
    this.track("group_join_assistant_request");
  },

  track(eventType) {
    const store = this.data.store || {};
    return api.trackEvent({
      event_type: eventType,
      page: "group_join",
      store_id: store.id,
      member_id: app.globalData.member.id
    }).catch(() => {});
  },

  backHome() {
    wx.switchTab({ url: "/pages/index/index" });
  }
});
