const config = require("./config");
const { getToken } = require("./storage");
const { mockRequest } = require("./mock-service");

function createRequestId() {
  return `req_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function createIdempotencyKey(prefix = "idem") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function unwrap(response) {
  if (response.code === 200) {
    return response.data;
  }
  return Promise.reject(response);
}

function request(options) {
  const method = options.method || "GET";
  const url = options.url;
  const data = options.data || {};
  const idempotent = Boolean(options.idempotent);

  if (config.useMock) {
    return mockRequest({ method, url, data }).then(unwrap);
  }

  const token = getToken();
  const header = {
    "Content-Type": "application/json",
    "X-Request-Id": createRequestId(),
    ...(idempotent ? { "X-Idempotency-Key": createIdempotencyKey() } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.baseUrl}${url}`,
      method,
      data,
      header,
      timeout: config.requestTimeout,
      success(res) {
        const body = res.data || {};
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 200) {
          resolve(body.data);
          return;
        }
        reject(body.code ? body : { code: res.statusCode, msg: "网络请求失败", data: null });
      },
      fail(error) {
        reject({ code: 50000, msg: error.errMsg || "网络请求失败", data: null });
      }
    });
  });
}

module.exports = {
  request,
  createIdempotencyKey
};
