Component({
  options: {
    styleIsolation: "apply-shared"
  },
  properties: {
    kind: {
      type: String,
      value: "success"
    },
    active: {
      type: Boolean,
      value: false
    },
    reduced: {
      type: Boolean,
      value: false
    }
  }
});
