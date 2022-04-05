import { canvas, makePen, bm, bg, rect, plot, pipe, rgb, hsl } from "./src/mod.mjs"

const randomRange = (min, max) => {
  return Math.random() * (max - min) + min
}

const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max)
}

const maprng = (n, start1, stop1, start2, stop2, bnds) => {
  const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  if(!bnds) return newval;
  else if(start2 < stop2) return clamp(newval, start2, stop2)
  else return clamp(newval, stop2, start2);
}

const cvw = 1000;
const cvh = 1000;
const ctx = canvas(cvw, cvh);
const bgcmd = pipe(makePen())
  .to(bg, { color: rgb(0xff, 0xf7, 0xf0)})
  .to(bm, { op: 'multiply' })
plot(ctx, bgcmd.value);

const organic = () => {
  const x = cvw / randomRange(70, 1000);

  let queue = pipe(makePen());
  for (let i = 0; i < cvh * 2; i += x) {
    const xp = cvw / 2 + (Math.tan(i) * i) / (x * 2);
    const yp = cvh - i;
    const hue = maprng(x, cvh / 1000, cvw / 70, 130, 50);
    queue.to(rect, { x: xp, y: yp, w: x, h: x, color: hsl(hue, 33, 45) });
  }

  plot(ctx, queue.value);
  requestAnimationFrame(organic);
};
requestAnimationFrame(organic);
