Component({
  options: {
    styleIsolation: "apply-shared"
  },
  properties: {
    coupon: {
      type: Object,
      value: {}
    },
    actionText: {
      type: String,
      value: "出示"
    }
  },
  data: {
    glyphKind: "dish",
    glyphState: "active"
  },
  observers: {
    coupon(coupon) {
      const kindMap = {
        base: "dish",
        reward: "store",
        used: "drink",
        referral: "referral"
      };
      const stateMap = {
        unused: "active",
        used: "used",
        expired: "expired",
        paused: "paused"
      };
      this.setData({
        glyphKind: kindMap[coupon && coupon.type] || "balance",
        glyphState: stateMap[coupon && coupon.status] || "active"
      });
    }
  },
  methods: {
    handleTap() {
      this.triggerEvent("action", this.properties.coupon);
    }
  }
});
