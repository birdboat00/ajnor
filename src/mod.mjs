export const pipe = value => ({
  value,
  to: (cb, ...args) => pipe(cb(value, ...args))
});

export const randomRange = (min, max) => {
  return Math.random() * (max - min) + min
}

export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max)
}

export const maprng = (n, start1, stop1, start2, stop2, bnds) => {
  const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  if(!bnds) return newval;
  else if(start2 < stop2) return clamp(newval, start2, stop2)
  return clamp(newval, stop2, start2);
}

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

const colascss = col => {
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

export const canvas = (sz, parent) => {
  const cnv = document.createElement("canvas");
  cnv.width = sz.w;
  cnv.height = sz.h;
  parent.appendChild(cnv);
  return { ctx: cnv.getContext("2d"), w: cnv.width, h: cnv.height };
};

export const defsketch = (props) => {
  if (props.title) document.title = props.title;
  const setup = props.setup || (_ => {})
  const view = props.view || (_ => {})
  const size = props.size || { w: 400, h: 300 }
  const framerate = props.framerate || props.fr || false;
  const times = props.times || false;
  const refreshsync = (!times && !framerate);
  const parent = document.getElementById(props.parent) || document.body; 

  const cv = canvas(size, parent);

  setup(cv);
  let iterations = 0;
  const loop = () => {
    view(cv);
    
    iterations = iterations + 1;
    if (refreshsync) requestAnimationFrame(loop)
    else if (framerate) setTimeout(() => loop(), 1000 / framerate)
    else if (iterations < times) requestAnimationFrame(loop)
  };

  if (refreshsync || (times > 0)) requestAnimationFrame(loop);
  else if (framerate) setTimeout(() => loop(), 1000 / framerate);
}

export const makePen = () => { return { queue: [] }; }

const cmd = (name, pen, props) => { return { queue: [...pen.queue, { cmd: name, ...props }]} };

export const bm = (pen, props) => cmd('bm', pen, props);
export const bg = (pen, props) => cmd('bg', pen, props);
export const rect = (pen, props) => cmd('rect', pen, props);
export const circle = (pen, props) => cmd('circle', pen, props);
export const arc = (pen, props) => cmd('arc', pen, props);
export const line = (pen, props) => cmd('ln', pen, props);
export const poly = (pen, props) => cmd('poly', pen, props);
export const text = (pen, props) => cmd('txt', pen, props);

export const szsquare = (len) => { return { w: len, h: len } };
export const szrect = (w, h) => { return { w, h } };

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
    'arc': (ctx, cmd) => {
      ctx.ctx.fillStyle = colascss(cmd.fill || cmd.color || colblack());
      ctx.ctx.strokeStyle = colascss(cmd.stroke || cmd.color || colblack());
      ctx.ctx.beginPath();
      ctx.ctx.arc(
        cmd.x || 0,
        cmd.y || 0,
        cmd.radius || cmd.r || 0,
        cmd.start || cmd.startAngle || 0,
        cmd.end || cmd.endAngle || cmd.angle
      );
      ctx.ctx.stroke();
      ctx.ctx.fill();
    },
    'ln': (ctx, cmd) => {
      ctx.ctx.strokeStyle = colascss(cmd.stroke || cmd.color || cmd.fill || colblack());
      ctx.ctx.lineWidth = cmd.weight || 1;
      ctx.ctx.beginPath();
      ctx.ctx.moveTo(cmd.x, cmd.y);
      ctx.ctx.lineTo(cmd.ex, cmd.ey);
      ctx.ctx.stroke();
    },
    'poly': (ctx, cmd) => {
      ctx.ctx.fillStyle = colascss(cmd.fill || cmd.color || colblack())
      ctx.ctx.strokeStyle = colascss(cmd.stroke || cmd.color || colblack())
      ctx.ctx.beginPath();
      ctx.ctx.moveTo(cmd.pts[0].x, cmd.pts[0].y)
      // use loop for performance reasons
      for (let i = 0; i < cmd.pts.length; i++) {
        ctx.ctx.lineTo(cmd.pts[i].x, cmd.pts[i].y)
      }
      ctx.ctx.closePath();
      ctx.ctx.stroke();
      ctx.ctx.fill();
    },
    'txt': (ctx, cmd) => {
      ctx.ctx.fillStyle = colascss(cmd.fill || cmd.color || colblack())
      ctx.ctx.strokeStyle = colascss(cmd.stroke || cmd.color || colblack())
      const fntn = cmd.fontName || 'serif';
      const fnts = cmd.fontSize || cmd.size || 12;
      const txt = cmd.text || cmd.displayString || "";
      ctx.ctx.font = `${fnts}px ${fntn}`
      ctx.ctx.strokeText(txt, cmd.x, cmd.y);
      ctx.ctx.fillText(txt, cmd.x, cmd.y);
    },
    'bm': (ctx, cmd) => {
      ctx.ctx.globalCompositeOperation = cmd.op || cmd.mode || 'source-over'
    }
  };

  pen.queue.forEach(cmd => {
    if(cmd.cmd in handlers) {
      handlers[cmd.cmd](ctx, cmd);
    } else {
      console.error(`Invalid cmd ${cmd.cmd}.`);
    }
  });
}
