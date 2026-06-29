function showApiError(error, fallback = "操作失败，请重试") {
  const title = error && error.msg ? error.msg : fallback;
  wx.showToast({
    title,
    icon: "none"
  });
}

function withLoading(title, task) {
  wx.showLoading({ title, mask: true });
  return Promise.resolve()
    .then(task)
    .finally(() => {
      wx.hideLoading();
    });
}

module.exports = {
  showApiError,
  withLoading
};
