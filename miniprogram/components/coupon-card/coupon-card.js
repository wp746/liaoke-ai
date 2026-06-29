Component({
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
  methods: {
    handleTap() {
      this.triggerEvent("action", this.properties.coupon);
    }
  }
});
