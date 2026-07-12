const glyphs = {
  store: "火",
  dish: "鲜",
  group: "聚",
  drink: "饮",
  balance: "余",
  points: "星",
  referral: "荐",
  ai: "AI"
};

Component({
  options: {
    styleIsolation: "apply-shared"
  },
  properties: {
    kind: {
      type: String,
      value: "points"
    },
    state: {
      type: String,
      value: "active"
    },
    value: {
      type: String,
      value: ""
    }
  },
  data: {
    symbol: "星"
  },
  observers: {
    kind(kind) {
      this.setData({ symbol: glyphs[kind] || "星" });
    }
  }
});
