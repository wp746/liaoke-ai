const { request } = require("./request");
const { setToken } = require("./storage");

function login(params) {
  return request({
    method: "POST",
    url: "/api/user/login",
    data: params
  }).then((data) => {
    setToken(data.session_token);
    return data;
  });
}

function getStoreDetail(storeId) {
  return request({
    method: "GET",
    url: "/api/store/detail",
    data: { store_id: storeId }
  });
}

function parseQr(scene) {
  return request({
    method: "GET",
    url: "/api/qr/parse",
    data: { scene }
  });
}

function issueCoupon(data) {
  return request({
    method: "POST",
    url: "/api/coupon/issue",
    data,
    idempotent: true
  });
}

function listCoupons(params) {
  return request({
    method: "GET",
    url: "/api/coupon/list",
    data: params
  });
}

function getCouponDetail(params) {
  return request({
    method: "GET",
    url: "/api/coupon/detail",
    data: params
  });
}

function generateAiText(data) {
  return request({
    method: "POST",
    url: "/api/ai/text",
    data,
    idempotent: true
  });
}

function getUploadToken(data) {
  return request({
    method: "POST",
    url: "/api/upload/token",
    data,
    idempotent: true
  });
}

function enhanceAiImage(data) {
  return request({
    method: "POST",
    url: "/api/ai/image",
    data,
    idempotent: true
  });
}

function generatePoster(data) {
  return request({
    method: "POST",
    url: "/api/poster/generate",
    data,
    idempotent: true
  });
}

function bindInvite(data) {
  return request({
    method: "POST",
    url: "/api/invite/bind",
    data,
    idempotent: true
  });
}

function previewVerify(couponCode) {
  return request({
    method: "GET",
    url: "/api/merchant/verify/preview",
    data: { coupon_code: couponCode }
  });
}

function merchantLogin(data) {
  return request({
    method: "POST",
    url: "/api/merchant/login",
    data
  });
}

function verifyCoupon(data) {
  return request({
    method: "POST",
    url: "/api/coupon/verify",
    data,
    idempotent: true
  });
}

function listReferralCoupons(params) {
  return request({
    method: "GET",
    url: "/api/user/referral-coupons",
    data: params
  });
}

function verifyReferralCoupon(data) {
  return request({
    method: "POST",
    url: "/api/store/verify/referral-coupon",
    data,
    idempotent: true
  });
}

function getPointsAccount(params) {
  return request({
    method: "GET",
    url: "/api/points/account",
    data: params
  });
}

function listPointsTransactions(params) {
  return request({
    method: "GET",
    url: "/api/points/transactions",
    data: params
  });
}

function listPointsProducts(params) {
  return request({
    method: "GET",
    url: "/api/points/products",
    data: params
  });
}

function redeemPointsProduct(data) {
  return request({
    method: "POST",
    url: "/api/points/redeem",
    data,
    idempotent: true
  });
}

function listPointsRedemptions(params) {
  return request({
    method: "GET",
    url: "/api/points/redemptions",
    data: params
  });
}

function signInForPoints(data) {
  return request({
    method: "POST",
    url: "/api/points/sign-in",
    data,
    idempotent: true
  });
}

function verifyPointsRedemption(data) {
  return request({
    method: "POST",
    url: "/api/store/verify/points-redemption",
    data,
    idempotent: true
  });
}

function getDailyStats(params) {
  return request({
    method: "GET",
    url: "/api/stats/daily",
    data: params
  });
}

function trackEvent(data) {
  return request({
    method: "POST",
    url: "/api/stats/event",
    data
  });
}

module.exports = {
  login,
  getStoreDetail,
  parseQr,
  issueCoupon,
  listCoupons,
  getCouponDetail,
  getUploadToken,
  generateAiText,
  enhanceAiImage,
  generatePoster,
  bindInvite,
  merchantLogin,
  previewVerify,
  verifyCoupon,
  listReferralCoupons,
  verifyReferralCoupon,
  getPointsAccount,
  listPointsTransactions,
  listPointsProducts,
  redeemPointsProduct,
  listPointsRedemptions,
  signInForPoints,
  verifyPointsRedemption,
  getDailyStats,
  trackEvent
};
