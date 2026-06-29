const config = require("./config");

function getWxLoginCode() {
  if (config.useMock || typeof wx === "undefined" || !wx.login) {
    return Promise.resolve("mock_wx_login_code");
  }

  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          resolve(res.code);
          return;
        }
        reject({ code: 40100, msg: "微信登录失败，请重试", data: null });
      },
      fail(error) {
        reject({ code: 40100, msg: error.errMsg || "微信登录失败", data: null });
      }
    });
  });
}

function parseLaunchScene(options = {}) {
  const query = options.query || {};
  const scene = query.scene ? decodeURIComponent(query.scene) : "s=STORE001&t=A12";
  const params = {};

  scene.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key) {
      params[key] = value || "";
    }
  });

  return {
    scene,
    storeId: query.store_id || params.s || "STORE001",
    tableId: query.table_id || params.t || "A12",
    inviterId: params.i || "",
    postId: params.p || ""
  };
}

module.exports = {
  getWxLoginCode,
  parseLaunchScene
};
