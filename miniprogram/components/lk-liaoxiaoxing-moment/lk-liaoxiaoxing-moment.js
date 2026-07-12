const sceneAssets = require("../../assets/brand/scenes/manifest");

Component({
  options: {
    styleIsolation: "apply-shared"
  },
  properties: {
    sceneId: {
      type: String,
      value: "home"
    },
    compact: {
      type: Boolean,
      value: false
    },
    decorative: {
      type: Boolean,
      value: false
    }
  },
  data: {
    imageSrc: sceneAssets.home
  },
  observers: {
    sceneId(sceneId) {
      this.setData({ imageSrc: sceneAssets[sceneId] || sceneAssets.home });
    }
  }
});
