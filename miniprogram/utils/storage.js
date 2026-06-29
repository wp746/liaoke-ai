const TOKEN_KEY = "LIAOKE_SESSION_TOKEN";
let memoryToken = "";

function hasWxStorage() {
  return typeof wx !== "undefined" && wx.getStorageSync && wx.setStorageSync && wx.removeStorageSync;
}

function getToken() {
  if (!hasWxStorage()) {
    return memoryToken;
  }
  return wx.getStorageSync(TOKEN_KEY) || "";
}

function setToken(token) {
  if (!hasWxStorage()) {
    memoryToken = token || "";
    return;
  }
  if (token) {
    wx.setStorageSync(TOKEN_KEY, token);
  }
}

function clearToken() {
  if (!hasWxStorage()) {
    memoryToken = "";
    return;
  }
  wx.removeStorageSync(TOKEN_KEY);
}

module.exports = {
  getToken,
  setToken,
  clearToken
};
