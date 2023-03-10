/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable no-plusplus */
/* eslint-disable no-return-assign */
/* eslint-disable consistent-return */
/* eslint-disable no-cond-assign */
/* eslint-disable no-bitwise */
/* eslint-disable no-throw-literal */
/* eslint-disable class-methods-use-this */
import _ from 'lodash';

function drawPreset(ctx, preset, cb) {
  const image = new Image();
  image.onload = () => {
    ctx.drawImage(image, 0, 0);
    cb();
  };
  image.src = preset;
}

function hexToRgb(hex) {
  if (hex === null) return [0, 0, 0, 0];
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
      255,
    ]
    : null;
}

let enableCall = true;
export default class DTool {
  constructor(pixelSize, canvasSize) {
    this.pixelSize = pixelSize;
    this.canvasSize = canvasSize;
    this.mouseMoveHandlerBinded = this.mouseMoveHandler.bind(this);
    this.mouseUpHandlerBinded = this.mouseUpHandler.bind(this);
    this.backgroundColor = '#FFFFFF';
    this.selectedColor = this.backgroundColor;
    this.selectedTool = 0;
    this.layers = [];
    this.selectedLayerIndex = 0;
    this.history = [];
    this.maxHistory = 20;
    this.currentHistoryPos = 0;
    this.disableDrawing = false;
    this.layersSettings = [];
  }

  init(layersSettings, historyChangeCallback) {
    this.historyChangeCallback = historyChangeCallback;
    const c = document.getElementById('drawingtool_canvas');
    if (!c) {
      setTimeout(() => {
        this.init(layersSettings, historyChangeCallback);
      }, 100);
      return;
    }
    this.layersSettings = [...layersSettings];
    this.c = c;

    this.size = this.pixelSize * this.canvasSize;
    c.setAttribute('width', this.canvasSize);
    c.setAttribute('height', this.canvasSize);
    this.ctx = c.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.initEvents();
    this.eraseCurrentLayer(); // ron
  }

  layersInit(layersSettings) {
    this.layers = [];
    for (let i = 0; i < layersSettings.length; i++) {
      const settings = layersSettings[i];
      const inMemoryCanvas = document.createElement('canvas');
      inMemoryCanvas.setAttribute('width', this.canvasSize);
      inMemoryCanvas.setAttribute('height', this.canvasSize);
      const ctx = inMemoryCanvas.getContext('2d');
      if (settings.preset) {
        drawPreset(ctx, settings.preset, () => {
          this.draw();
          this.saveHistory(); // initial state
        });
      }
      this.layers.push({
        ctx,
        c: inMemoryCanvas,
        label: settings.label,
      });
    }
    this.draw();
  }

  undoredo(dir) {
    const curBtnStates = this.getURButtonsState();
    if (dir === -1 && !curBtnStates[0]) return;
    if (dir === 1 && !curBtnStates[1]) return;
    this.currentHistoryPos -= dir;
    if (this.currentHistoryPos <= 0) this.currentHistoryPos = 0;
    if (this.currentHistoryPos >= this.history.length) {
      this.currentHistoryPos = this.history.length - 1;
    }
    _.each(this.layers, (l, i) => {
      l.ctx.putImageData(this.history[this.currentHistoryPos][i], 0, 0);
    });
    this.draw();
    return this.historyChangeCallback(this.getURButtonsState());
  }

  saveHistory() {
    if (this.currentHistoryPos > 0) {
      this.history = this.history.slice(
        this.currentHistoryPos,
        this.history.length,
      );
      this.currentHistoryPos = 0;
    }
    this.history.unshift(
      _.map(this.layers, (layer) => layer.ctx.getImageData(
        0,
        0,
        layer.ctx.canvas.width,
        layer.ctx.canvas.height,
      ),
      ),
    );
    this.history = this.history.slice(0, this.maxHistory);

    this.historyChangeCallback(this.getURButtonsState());
  }

  getURButtonsState() {
    return [
      this.history.length > 1 &&
        this.currentHistoryPos < this.history.length - 1,
      this.currentHistoryPos > 0,
    ];
  }

  selectTool(tool) {
    this.selectedTool = tool;
  }

  selectLayer(index) {
    this.selectedLayerIndex = index;
  }

  initEvents() {
    this.c.addEventListener('mousedown', this.mouseDownHandler.bind(this));
  }

  selectColor(color) {
    if (color) {
      this.selectedColor = color;
    } else {
      this.selectedColor = null;
    }
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.size, this.size);
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fill();
    for (let l = 0; l < this.layers.length; l++) {
      this.ctx.drawImage(this.layers[l].c, 0, 0);
    }
  }

  eraseCurrentLayer() {
    this.layersInit(this.layersSettings);
    const layer = this.layers[this.selectedLayerIndex];
    layer.ctx.clearRect(0, 0, layer.ctx.canvas.width, layer.ctx.canvas.height);
    this.historyChangeCallback(this.getURButtonsState()); // ron
  }

  mouseUpHandler(e) {
    document.removeEventListener('mouseup', this.mouseUpHandlerBinded);
    this.c.removeEventListener('mousemove', this.mouseMoveHandlerBinded);
    this.saveHistory();
  }

  getCorrectPos(e) {
    const rect = this.c.getBoundingClientRect();
    const style = this.c.currentStyle || window.getComputedStyle(this.c);
    const borderLeftWidth = parseInt(style.borderLeftWidth);
    const borderRightWidth = parseInt(style.borderRightWidth);
    const borderTopWidth = parseInt(style.borderTopWidth);
    const borderBottomWidth = parseInt(style.borderBottomWidth);
    const mx = e.clientX - rect.left - borderLeftWidth;
    const my = e.clientY - rect.top - borderTopWidth;
    let px = Math.floor(
      mx /
        ((this.c.getBoundingClientRect().width -
          borderLeftWidth -
          borderRightWidth) /
          this.canvasSize),
    );
    px = Math.min(Math.max(0, px), this.canvasSize - 1);
    let py = Math.floor(
      my /
        ((this.c.getBoundingClientRect().height -
          borderTopWidth -
          borderBottomWidth) /
          this.canvasSize),
    );
    py = Math.min(Math.max(0, py), this.canvasSize - 1);
    return { x: px, y: py };
  }

  rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) throw 'Invalid color component';
    return ((r << 16) | (g << 8) | b).toString(16);
  }

  getColor(e) {
    const correctPos = this.getCorrectPos(e);
    const c = e.target.getContext('2d');
    const p = c.getImageData(correctPos.x, correctPos.y, 1, 1).data;
    const hex = `#${(`000000${this.rgbToHex(p[0], p[1], p[2])}`).slice(-6)}`;
    return hex;
  }

  getRandomColor() {
    const hex =
      `#${
        (
          `000000${
            this.rgbToHex(
              Math.random() * 255,
              Math.random() * 255,
              Math.random() * 255,
            )}`
        ).slice(-6)}`;
    return hex;
  }

  getAllowedRandomColor(layerIndex) {
    const layer = this.layersSettings[layerIndex];
    if (!layer) return;
    const { bannedColors } = layer;
    let hex;
    if (bannedColors && bannedColors.length) {
      while (bannedColors.indexOf((hex = this.getRandomColor())) !== -1);
    } else {
      hex = this.getRandomColor();
    }
    return hex;
  }

  fillWithRandomColor(layerIndex) {
    const layerSetting = this.layersSettings[layerIndex];
    const layer = this.layers[layerIndex];
    if (!layerSetting || !layer) return;
    const { fillPoints } = layerSetting;
    if (!fillPoints || !fillPoints.length) {
      return;
    }
    fillPoints.forEach((ptObj) => {
      const randomColor = hexToRgb(this.getAllowedRandomColor(layerIndex));
      ptObj.points.forEach((pt) => {
        this._floodFill(layer.ctx, pt[0], pt[1], randomColor);
      });
    });
    this.draw();
    this.saveHistory();
  }

  mouseMoveHandler(e) {
    enableCall = false;
    const layer = this.layers[this.selectedLayerIndex];
    const correctPos = this.getCorrectPos(e);

    if (this.selectedColor) {
      layer.ctx.beginPath();
      layer.ctx.fillStyle = this.selectedColor;
      layer.ctx.rect(correctPos.x, correctPos.y, 1, 1);
      layer.ctx.fill();
      layer.ctx.closePath();
    } else {
      layer.ctx.clearRect(correctPos.x, correctPos.y, 1, 1);
    }

    this.draw();
    setTimeout(() => (enableCall = true), 10);
  }

  mouseDownHandler(e) {
    if (this.disableDrawing) return;
    if (this.selectedTool === 0) {
      // pencil
      document.addEventListener('mouseup', this.mouseUpHandlerBinded);
      this.c.addEventListener('mousemove', this.mouseMoveHandlerBinded);
      this.mouseMoveHandler(e);
    } else {
      // paint
      this.fillHandler(e);
      this.draw();
      this.saveHistory();
    }
  }

  noise() {
    const layer = this.layers[0];
    for (let x = 0; x < layer.ctx.canvas.width; x++) {
      for (let y = 0; y < layer.ctx.canvas.width; y++) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        layer.ctx.beginPath();
        layer.ctx.fillStyle = `rgb(${r},${g}, ${b})`;
        layer.ctx.rect(x, y, 1, 1);
        layer.ctx.fill();
        layer.ctx.closePath();
      }
    }
    this.draw();
  }

  readAsDataURLAsync(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async getWebp() {
    const inMemoryCanvas = document.createElement('canvas');
    inMemoryCanvas.setAttribute('width', 400);
    inMemoryCanvas.setAttribute('height', 400);
    const inMemoryContext = inMemoryCanvas.getContext('2d');
    inMemoryContext.imageSmoothingEnabled = false;
    inMemoryContext.drawImage(this.c, 0, 0, 400, 400);
    inMemoryCanvas.style =
      'image-rendering: -moz-crisp-edges;image-rendering: -webkit-crisp-edges;image-rendering: pixelated;image-rendering: crisp-edges;';
    const blob = await fetch(inMemoryCanvas.toDataURL('image/webp', 1))
      .then((response) => response.blob())
      .catch(console.error);
    const base64data = (await this.readAsDataURLAsync(blob)).slice(23);
    return base64data;
  }

  async downloadPng() {
    const inMemoryCanvas = document.createElement('canvas');
    inMemoryCanvas.setAttribute('width', 400);
    inMemoryCanvas.setAttribute('height', 400);
    const inMemoryContext = inMemoryCanvas.getContext('2d');
    inMemoryContext.imageSmoothingEnabled = false;
    inMemoryContext.drawImage(this.c, 0, 0, 400, 400);
    inMemoryCanvas.style =
      'image-rendering: -moz-crisp-edges;image-rendering: -webkit-crisp-edges;image-rendering: pixelated;image-rendering: crisp-edges;';
    const blob = await fetch(inMemoryCanvas.toDataURL('image/png', 1))
      .then((response) => response.blob())
      .catch(console.error);
    const href = (await this.readAsDataURLAsync(blob));
    const link = document.createElement('a');
    link.download = 'custom-duck.png';
    link.href = href;
    link.click();
  }

  fillHandler(e) {
    const layer = this.layers[this.selectedLayerIndex];
    const correctPos = this.getCorrectPos(e);
    this._floodFill(
      layer.ctx,
      correctPos.x,
      correctPos.y,
      hexToRgb(this.selectedColor),
    );
  }

  _getPixel(imageData, x, y) {
    if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
      return [-1, -1, -1, -1]; // impossible color
    }
    const offset = (y * imageData.width + x) * 4;
    return imageData.data.slice(offset, offset + 4);
  }

  _setPixel(imageData, x, y, color) {
    const offset = (y * imageData.width + x) * 4;
    imageData.data[offset + 0] = color[0];
    imageData.data[offset + 1] = color[1];
    imageData.data[offset + 2] = color[2];
    imageData.data[offset + 3] = color[3];
  }

  _colorsMatch(a, b, rangeSq) {
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];
    const da = a[3] - b[3];
    return dr * dr + dg * dg + db * db + da * da < rangeSq;
  }

  _floodFill(ctx, x, y, fillColor, range = 1) {
    const imageDataSource = this.ctx.getImageData(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height,
    );
    const imageDataTarget = ctx.getImageData(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height,
    );

    const visited = new Uint8Array(
      imageDataSource.width * imageDataSource.height,
    );

    const targetColor = this._getPixel(imageDataSource, x, y);

    if (!this._colorsMatch(targetColor, fillColor)) {
      const rangeSq = range * range;
      const pixelsToCheck = [x, y];
      while (pixelsToCheck.length > 0) {
        const y = pixelsToCheck.pop();
        const x = pixelsToCheck.pop();

        const currentColor = this._getPixel(imageDataSource, x, y);

        if (
          visited[y * imageDataSource.width + x] === 0 &&
          this._colorsMatch(currentColor, targetColor, rangeSq)
        ) {
          this._setPixel(imageDataSource, x, y, fillColor);
          this._setPixel(imageDataTarget, x, y, fillColor);
          visited[y * imageDataSource.width + x] = 1; // mark we were here already
          pixelsToCheck.push(x + 1, y);
          pixelsToCheck.push(x - 1, y);
          pixelsToCheck.push(x, y + 1);
          pixelsToCheck.push(x, y - 1);
        }
      }

      // put the data back
      ctx.putImageData(imageDataTarget, 0, 0);
      this.draw();
    }
  }
}
