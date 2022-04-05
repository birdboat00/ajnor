export const pipe = value => ({
  value,
  to: (cb, ...args) => pipe(cb(value, ...args))
});

export const rgb = (r, g, b) => {
  return { r, g, b }
}

export const colblack = () => rgb(0, 0, 0);
export const colwhite = () => rgb(255, 255, 255);
export const colred = () => rgb(255, 0, 0);
export const colgreen = () => rgb(0, 255, 0);
export const colblue = () => rgb(0, 0, 255);
export const colyellow = () => rgb(255, 255, 0);
export const colmagenta = () => rgb(255, 0, 255);
export const colcyan = () => rgb(0, 255, 255);

export const cols = {
  colblack, colwhite, colred, colgreen, colblue, colyellow, colmagenta,
  colcyan
};

export const colascss = col => {
  return `rgb(${col.r}, ${col.g}, ${col.b})`
}

export const hsl = (_h, _s, _l) => {
  const h = _h / 359;
  const s = _s / 100;
  const l = _l / 100;
  if (s == 0) {
    const ll = l * 255;
    return rgb(ll, ll, ll);
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 1 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const r = hue2rgb(p, q, h + 1 / 3) * 255
    const g = hue2rgb(p, q, h) * 255
    const b = hue2rgb(p, q, h - 1 / 3) * 255
    return rgb(r, g, b)
  }
}

export const makeContext = (sizeX, sizeY) => {
  const cnv = document.createElement("canvas");
  cnv.width = sizeX;
  cnv.height = sizeY;
  document.body.appendChild(cnv);

  return { ctx: cnv.getContext("2d") }
}
export const canvas = makeContext;

export const makePen = () => {
  return { queue: [] };
}

export const bm = (pen, props) => {
  let newpen = { ...pen }
  newpen.queue.push({ cmd: 'bm', ...props })
  return newpen
}

export const bg = (pen, props) => {
  let newpen = { ...pen }
  newpen.queue.push({ cmd: 'bg', ...props })
  return newpen
};

export const rect = (pen, props) => {
  let newpen = { ...pen }
  newpen.queue.push({ cmd: 'rect', ...props })
  return newpen
}

export const circle = (pen, props) => {
  let newpen = { ...pen }
  newpen.queue.push({ cmd: 'circle', ...props })
  return newpen
};

export const plot = (ctx, pen) => {
  const handlers = {
    'bg': (ctx, cmd) => {
      const fs = cmd.fill || cmd.color || colblack();
      ctx.ctx.fillStyle = colascss(fs);
      const params = [0, 0, ctx.ctx.canvas.width, ctx.ctx.canvas.height];
      ctx.ctx.clearRect(...params);
      ctx.ctx.fillRect(...params);
    },
    'rect': (ctx, cmd) => {
      ctx.ctx.fillStyle = colascss(cmd.fill || cmd.color || colblack());
      ctx.ctx.strokeStyle = colascss(cmd.stroke || cmd.color || colblack());
      ctx.ctx.fillRect(cmd.x || 0, cmd.y || 0, cmd.w || 0, cmd.h || 0);
      ctx.ctx.strokeRect(cmd.x || 0, cmd.y || 0, cmd.w || 0, cmd.h || 0);
    },
    'circle': (ctx, cmd) => {
      ctx.ctx.fillStyle = colascss(cmd.fill || cmd.color || colblack());
      ctx.ctx.strokeStyle = colascss(cmd.stroke || cmd.color || colblack());
      ctx.ctx.beginPath();
      ctx.ctx.arc(
        cmd.x || 0,
        cmd.y || 0,
        cmd.radius || cmd.r || 0,
        0, Math.PI * 2
      );
      ctx.ctx.stroke();
      ctx.ctx.fill();
    },
    'bm': (ctx, cmd) => {
      ctx.ctx.globalCompositeOperation = cmd.op || cmd.mode || 'source-over'
    }
  };

  for (const cmd of pen.queue) {
    if (cmd.cmd in handlers) {
      handlers[cmd.cmd](ctx, cmd);
    } else {
      console.error(`ajnor:No cmd for ${cmd.cmd}. Available: ${Object.keys(handlers)}.`);
    }
  }
}
