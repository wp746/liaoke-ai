const config = require("./config");
const api = require("./api");

function getFileName(filePath = "") {
  const parts = filePath.split("/");
  return parts[parts.length - 1] || `liaoke-upload-${Date.now()}.jpg`;
}

function uploadImage(filePath) {
  if (!filePath) {
    return Promise.resolve({ file_url: "", object_key: "" });
  }

  if (config.useMock || typeof wx === "undefined" || !wx.uploadFile) {
    return Promise.resolve({
      file_url: filePath,
      object_key: `mock/uploads/${getFileName(filePath)}`
    });
  }

  return api.getUploadToken({
    filename: getFileName(filePath),
    content_type: "image/jpeg",
    purpose: "ai_play"
  }).then((token) => new Promise((resolve, reject) => {
    wx.uploadFile({
      url: token.upload_url,
      filePath,
      name: token.form_field || "file",
      formData: token.form_data || {},
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            file_url: token.file_url,
            object_key: token.object_key,
            raw: res.data
          });
          return;
        }
        reject({ code: res.statusCode, msg: "图片上传失败", data: null });
      },
      fail(error) {
        reject({ code: 50000, msg: error.errMsg || "图片上传失败", data: null });
      }
    });
  }));
}

module.exports = {
  uploadImage
};
