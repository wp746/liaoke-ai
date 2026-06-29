const app = getApp();

Page({
  data: {
    poster: null,
    store: {},
    canvasReady: false,
    canvasImagePath: ""
  },

  onShow() {
    app.bootstrap().then(({ store }) => {
      this.setData({
        poster: app.globalData.selectedPoster || {
          title: "高级日常",
          copy: "今天这顿吊龙嫩到离谱，锅气和烟火气都刚刚好。",
          style: "高级日常",
          scene: `s=${store.id}&i=${app.globalData.member.id}&p=POST_DEMO`
        },
        store
      }, () => this.drawPosterCanvas());
    });
  },

  onReady() {
    this.setData({ canvasReady: true }, () => this.drawPosterCanvas());
  },

  copyText() {
    wx.setClipboardData({ data: this.data.poster.copy });
  },

  savePoster() {
    this.exportPoster().then((tempFilePath) => {
      wx.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => wx.showToast({ title: "已保存到相册", icon: "success" }),
        fail: (error) => {
          if (error.errMsg && error.errMsg.includes("auth deny")) {
            wx.showModal({
              title: "需要相册权限",
              content: "请允许保存到相册后，再保存你的燎客海报。",
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting();
                }
              }
            });
            return;
          }
          wx.showToast({ title: "保存失败，请重试", icon: "none" });
        }
      });
    }).catch(() => {
      wx.showToast({ title: "海报生成失败", icon: "none" });
    });
  },

  regenerate() {
    wx.navigateBack();
  },

  drawPosterCanvas() {
    if (!this.data.canvasReady || !this.data.poster || !this.data.store.name) {
      return;
    }

    const query = wx.createSelectorQuery().in(this);
    query.select("#posterCanvas").fields({ node: true, size: true }).exec((res) => {
      const canvasInfo = res && res[0];
      if (!canvasInfo || !canvasInfo.node) {
        return;
      }

      const canvas = canvasInfo.node;
      this.posterCanvasNode = canvas;
      const ctx = canvas.getContext("2d");
      const dpr = wx.getSystemInfoSync().pixelRatio || 2;
      const width = 750;
      const height = 1120;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      this.paintPoster(ctx, canvas, width, height).then(() => {
        this.exportPoster().then((canvasImagePath) => {
          this.setData({ canvasImagePath });
        }).catch(() => {});
      });
    });
  },

  paintPoster(ctx, canvas, width, height) {
    const poster = this.data.poster;
    const store = this.data.store;

    const mascotPromise = this.loadCanvasImage(canvas, "/assets/brand/png/liaoxiaoxing.png");
    const qrcodePromise = poster.qrcode_url
      ? this.loadCanvasImage(canvas, poster.qrcode_url).catch(() => null)
      : Promise.resolve(null);

    return Promise.all([mascotPromise, qrcodePromise]).then(([mascot, qrcode]) => {
      ctx.fillStyle = "#FFF8EC";
      ctx.fillRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, width, 560);
      gradient.addColorStop(0, "#FF4B1B");
      gradient.addColorStop(0.52, "#FF8A12");
      gradient.addColorStop(1, "#6A1F16");
      this.roundRect(ctx, 46, 44, width - 92, 540, 44);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.drawImage(mascot, 250, 135, 250, 282);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 60px sans-serif";
      ctx.fillText("今日份快乐", 82, 456);
      ctx.fillText("由肉治愈", 82, 526);

      ctx.fillStyle = "#1F1F23";
      ctx.font = "900 38px sans-serif";
      ctx.fillText(store.name || "牛里牛气潮汕牛肉火锅", 64, 670);

      ctx.fillStyle = "#5F6068";
      ctx.font = "400 28px sans-serif";
      this.wrapText(ctx, poster.copy || "", 64, 728, width - 128, 44, 5);

      ctx.fillStyle = "#FF4B1B";
      ctx.font = "800 24px sans-serif";
      ctx.fillText("燎客 AI / SparkFlow AI", 64, 962);

      if (qrcode) {
        this.drawQrImage(ctx, qrcode, 548, 840, 160);
      } else {
        this.drawMiniProgramCode(ctx, 566, 858, 124, poster.scene || "");
      }

      ctx.fillStyle = "#5F6068";
      ctx.font = "400 22px sans-serif";
      ctx.fillText(store.slogan || "吃肉的人终会相遇", 64, 1008);
      ctx.fillText("扫码领券 · AI 晒圈", 64, 1042);
    });
  },

  exportPoster() {
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        canvas: this.posterCanvasNode,
        fileType: "png",
        quality: 1,
        success: (res) => resolve(res.tempFilePath),
        fail: reject
      }, this);
    });
  },

  loadCanvasImage(canvas, src) {
    return new Promise((resolve, reject) => {
      const image = canvas.createImage();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  },

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },

  wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    let line = "";
    let lineCount = 0;
    for (const char of text) {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, y + lineCount * lineHeight);
        line = char;
        lineCount += 1;
        if (lineCount >= maxLines) {
          return;
        }
      } else {
        line = testLine;
      }
    }
    if (line && lineCount < maxLines) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
    }
  },

  drawMiniProgramCode(ctx, x, y, size, scene) {
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    this.roundRect(ctx, x - 18, y - 18, size + 36, size + 62, 22);
    ctx.fill();
    ctx.fillStyle = "#1F1F23";
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        if ((row + col + scene.length) % 3 !== 0) {
          ctx.fillRect(x + col * 16, y + row * 16, 10, 10);
        }
      }
    }
    ctx.font = "700 18px sans-serif";
    ctx.fillText("小程序码", x + 18, y + size + 28);
    ctx.restore();
  },

  drawQrImage(ctx, image, x, y, size) {
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    this.roundRect(ctx, x - 14, y - 14, size + 28, size + 50, 22);
    ctx.fill();
    ctx.drawImage(image, x, y, size, size);
    ctx.fillStyle = "#1F1F23";
    ctx.font = "700 18px sans-serif";
    ctx.fillText("小程序码", x + 42, y + size + 30);
    ctx.restore();
  }
});
