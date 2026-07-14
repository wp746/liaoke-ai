const colors = [
  [1, 0.294, 0.106, 1],
  [1, 0.42, 0.102, 1],
  [0.973, 0.722, 0.302, 1],
  [1, 0.541, 0.071, 1],
  [1, 0.78, 0.22, 1],
  [1, 0.35, 0.08, 1],
];

const positions = [
  [-2, -1, 0],
  [-1, 1, 0],
  [0, -2, 0],
  [1, 1, 0],
  [2, -1, 0],
  [0, 2, 0],
];

const items = colors.map((color, index) => ({
  id: String(index + 1),
  name: `spark-${index + 1}`,
  type: "1",
  visible: true,
  duration: 1.5,
  delay: index * 0.04,
  endBehavior: 0,
  renderLevel: "B+",
  content: {
    options: { startColor: color },
    positionOverLifetime: { direction: [0, 0, 0], startSpeed: 0, gravity: [0, 0, 0] },
    sizeOverLifetime: { size: [6, [[0, 0, 0, 2], [0.3, 1.4, 2, -1], [1, 0, -1, 0]]] },
    colorOverLifetime: { opacity: [6, [[0, 0, 0, 3], [0.2, 1, 0, 0], [1, 0, 0, 0]]] },
  },
  transform: { position: positions[index], rotation: [0, 0, 0], scale: [1, 1, 1] },
}));

export const sparkSuccessScene = {
  compositionId: "1",
  requires: [],
  images: [],
  bins: [],
  textures: [],
  shapes: [],
  plugins: [],
  version: "1.5",
  type: "mars",
  compositions: [{
    id: "1",
    name: "liaoke-spark-success",
    duration: 1.5,
    startTime: 0,
    endBehavior: 0,
    previewSize: [512, 512],
    items,
    camera: {
      fov: 60,
      far: 20,
      near: 0.1,
      clipMode: 1,
      position: [0, 0, 8],
      rotation: [0, 0, 0],
    },
  }],
};
