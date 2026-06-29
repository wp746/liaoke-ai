const api = require("../../utils/api");

Page({
  data: {
    stats: {},
    statCards: []
  },

  onLoad() {
    api.getDailyStats({ store_id: "STORE001" }).then((stats) => {
      this.setData({
        stats,
        statCards: [
          { label: "扫码人数", value: stats.scanCount },
          { label: "发券数量", value: stats.issuedCount },
          { label: "核销数量", value: stats.verifiedCount },
          { label: "AI 使用人数", value: stats.aiUsers },
          { label: "海报生成", value: stats.posters },
          { label: "入群点击", value: stats.groupClicks }
        ]
      });
    }).catch((error) => {
      wx.showToast({ title: error.msg || "数据加载失败", icon: "none" });
    });
  }
});
