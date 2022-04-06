// Base functions
export const pipe = x => ({ value: x, to: (f, ...a) => pipe(f(x, ...a))});

// Math
export const max = Math.max;
export const min = Math.min;
export const rnd = Math.random;
export const PI = Math.PI;
export const rndrn = (mn, mx) => rnd() * (mx - mn) + mn;
export const rndrni = (mn, mx) => {
  const _mn = Math.ceil(mn);
  const _mx = Math.floor(mx);
  return Math.floor(rnd() * (_mx - _mn)) + _mn;
}
export const clamp = (n, mn, mx) => min(max(n, mn), mx);
export const maprn = (n, b1, e1, b2, e2, b) => {
  const nv = (n - b1) / (e1 - b1) * (e2 - b2) + b2;
  return !b  ? nv : ((b2 < e2) ? clamp(nv, b2, e2) : clamp(nv, e2, b2));
}

// colors
export const col = v => rgb(v, v, v);
export const cola = v => rgba(v, v, v, v);
export const rgba = (r, g, b, a) => ({ r, g, b, a });
export const rgb = (r, g, b) => rgba(r, g, b, 255);
export const rgbah = h => rgba((h>>24)&0xff,(h>>16)&0xff,(h>>8)&&0xff);
export const colblack = () => rgb(0, 0, 0);
export const colwhite = () => rgb(255, 255, 255);
export const colred = () => rgb(255, 0, 0);
export const colgreen = () => rgb(0, 255, 0);
export const colblue = () => rgb(0, 0, 255);
export const colyellow = () => rgb(255, 255, 0);
export const colmagenta = () => rgb(255, 0, 255);
export const colcyan = () => rgb(0, 255, 255);
export const coltransparent = () => cola(0);
const colcss = c => `rgb(${c.r}, ${c.g}, ${c.b})`;
export const hsl = (hue, sat, lig) => {
  const k = n => (n+hue / 30) % 12;
  const a = (sat/100) * min(l, 1-l);
  const f =n=>(lig/100)-a*max(-1,min(k(n)-3,min(9-k(n),1)));
  return rgb(255 * f(0), 255 * f(8), 255 * f(4))
}
export const hsb = (hue, sat, bri) => {
  const s = sat / 100;
  const b = bri / 100;
  const k = (n) => (n+hue/60)%6;
  const f = (n) => b*(1-s*max(0,min(k(n),4-k(n),1)));
  return rgb(255 * f(5), 255 * f(3), 255 * f(1))
}

// sizes
export const sz = (w, h) => ({ w, h })
export const szsquare = (len) => sz(len, len);
const cdist = (mm, ppi = 96) => Math.round(mm * ppi / 24.5) 
const convdimtopix = (ds, ppi = 96) => ({ w: cdist(ds.w, ppi), h: cdist(ds.h, ppi)})
export const szmm = (w, h) => convdimtopix(w, h)
export const szpa3 = _ => szmm(297, 420)
export const szpa4 = _ => szmm(210, 297)
export const szpa5 = _ => szmm(140, 210)
export const szpa6 = _ => szmm(105, 148)
export const szpa7 = _ => szmm(74, 105)

// pts
export const pt = (x, y) => ({ x, y })
export const ptzero = _ => pt(0, 0)

// sketch
const canvas = (sz, parent) => {
  const cnv = document.createElement("canvas");
  cnv.width = sz.w;
  cnv.height = sz.h;
  parent.appendChild(cnv);
  return {ctx: cnv.getContext("2d"), w: cnv.width, h: cnv.height, parent}
};

export const defsketch = (props) => {
  document.title = props.title || document.title
  const setup = props.setup || (_ => {})
  const view = props.view || (_ => {})
  const size = props.size || { w: 400, h: 400 }
  const framerate = props.framerate || props.fr || false
  const times = props.times || false
  const refreshsync = (!times && !framerate)
  const parent = document.getElementById(props.parent) || document.body 

  const cv = canvas(size, parent);
  
  let model = setup(cv) || {};
  let iterations = 0;
  const loop = () => {
    model = view(cv, model) || model;
    
    iterations = iterations + 1;
    if (refreshsync) requestAnimationFrame(loop)
    else if (framerate) setTimeout(() => loop(), 1000 / framerate)
    else if (iterations < times) requestAnimationFrame(loop)
  };

  if (refreshsync || (times > 0)) requestAnimationFrame(loop);
  else if (framerate) setTimeout(() => loop(), 1000 / framerate);
}

// drawing
export const mkpen = () => ({ queue: [] })

const cmd = (cmd, pen, props) => ({ queue: [...pen.queue, { cmd, ...props }]})
export const bm = (pen, props) => cmd('bm', pen, props);
export const bg = (pen, props) => cmd('bg', pen, props);
export const rect = (pen, props) => cmd('shr', pen, props);
export const circle = (pen, props) => cmd('shc', pen, props);
export const arc = (pen, props) => cmd('sha', pen, props);
export const line = (pen, props) => cmd('shl', pen, props);
export const point = (pen, props) => cmd('shpt', pen, props);
export const poly = (pen, props) => cmd('shp', pen, props);
export const text = (pen, props) => cmd('sht', pen, props);
export const push = (pen, props) => cmd('sps', pen, props);
export const pop = (pen, props) => cmd('spo', pen, props);
export const pixels = (pen, props) => cmd('pxs', pen, props);

const cfilcss = c => colcss(c.fill || c.color || c.c || colblack());
const cstrcss = c => c.stroke ? colcss(c.stroke) : cfilcss(c);
const cposx = c => c.x || (c.p || c.pos).x || 0;
const cposy = c => c.y || (c.p || c.pos).y || 0;
export const measuretext = (ctx, str, sz, fnt) => {
  ctx.ctx.font = `${sz}px ${fnt}`;
  const res = ctx.ctx.measureText(str);
  return sz(res.width, res.height);
};

export const plot = (ctx, pen) => {
  const handlers = {
    'pxs': (ctx, cmd) => {
      pipe(ctx.ctx.getImageData(0, 0, ctx.w, ctx.h))
        .to(cmd.fn)
        .to(ctx.ctx.putImageData, 0, 0);
    },
    'bg': (ctx, cmd) => {
      ctx.ctx.fillStyle = cfilcss(cmd);
      const params = [0, 0, ctx.ctx.canvas.width, ctx.ctx.canvas.height];
      ctx.ctx.clearRect(...params);
      ctx.ctx.fillRect(...params);
    },
    'shr': (ctx, cmd) => {
      ctx.ctx.fillStyle = cfilcss(cmd);
      ctx.ctx.strokeStyle = cstrcss(cmd);
      const x = cposx(cmd); const y = cposy(cmd);
      ctx.ctx.fillRect(x, y, cmd.w || 0, cmd.h || 0);
      ctx.ctx.strokeRect(x, y, cmd.w || 0, cmd.h || 0);
    },
    'shc': (ctx, cmd) => {
      ctx.ctx.fillStyle = cfilcss(cmd);
      ctx.ctx.strokeStyle = cstrcss(cmd);
      ctx.ctx.beginPath();
      ctx.ctx.arc(cposx(cmd), cposy(cmd), cmd.radius || cmd.r || 0,
        0, Math.PI * 2
      );
      ctx.ctx.stroke();
      ctx.ctx.fill();
    },
    'sha': (ctx, cmd) => {
      ctx.ctx.fillStyle = cfilcss(cmd);
      ctx.ctx.strokeStyle = cstrcss(cmd);
      ctx.ctx.beginPath();
      ctx.ctx.arc(cposx(cmd), cposy(cmd),
        cmd.radius || cmd.r || 0,
        cmd.start || cmd.startAngle || 0,
        cmd.end || cmd.endAngle || cmd.angle || 0
      );
      ctx.ctx.stroke();
      ctx.ctx.fill();
    },
    'shl': (ctx, cmd) => {
      ctx.ctx.strokeStyle = cstrcss(cmd);
      ctx.ctx.lineWidth = cmd.weight || 1;
      ctx.ctx.beginPath();
      ctx.ctx.moveTo(cposx(cmd), cposy(cmd));
      ctx.ctx.lineTo(cmd.ex, cmd.ey);
      ctx.ctx.stroke();
    },
    'shp': (ctx, cmd) => {
      ctx.ctx.fillStyle = cfilcss(cmd);
      ctx.ctx.strokeStyle = cstrcss(cmd);
      ctx.ctx.beginPath();
      ctx.ctx.moveTo(cmd.pts[0].x, cmd.pts[0].y)
      cmd.pts.slice(1).forEach(pt => ctx.ctx.lineTo(pt.x, pt.y));
      ctx.ctx.closePath();
      ctx.ctx.stroke();
      ctx.ctx.fill();
    },
    'sht': (ctx, cmd) => {
      ctx.ctx.fillStyle = cfilcss(cmd);
      ctx.ctx.strokeStyle = cstrcss(cmd);
      const fntn = cmd.fontName || 'serif';
      const fnts = cmd.fontSize || cmd.size || 12;
      ctx.ctx.font = `${fnts}px ${fntn}`
      const txt = cmd.text || cmd.displayString || "";
      ctx.ctx.strokeText(txt, cposx(cmd), cposy(cmd));
      ctx.ctx.fillText(txt, cposx(cmd), cposy(cmd));
    },
    'bm': (ctx, cmd) => {
      ctx.ctx.globalCompositeOperation = cmd.op || cmd.mode || 'source-over'
    },
    'sps': (ctx, _) => ctx.ctx.save(), 'spo': (ctx, _) => ctx.ctx.restore()
  }

  pen.queue
    .filter(c => c.cmd in handlers)
    .forEach(c => handlers[c.cmd](ctx, c));
}
