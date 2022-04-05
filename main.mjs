import * as ron from "./src/mod.mjs"

  ron.defsketch({
  size: ron.szsquare(1000),
  title: "x-organic",
  view: (cv) => {
    const p = cv.w / ron.randomRange(70, 1000);
    const loop = (i, cmds) => {
      if (i < cv.h * 2) {
        const x = cv.w / 2 + (Math.tan(i) * i) / (p * 2);
        const y = cv.h - i;
        const hue = ron.maprng(p, cv.h / 1000, cv.w / 70, 130, 50);
        const q = cmds.to(ron.rect, {x: x, y: y, w: p, h: p, color: ron.hsl(hue, 33, 45)});
        return loop(i + p, q);
      }
      return cmds;
    }
    const q = loop(0, ron.pipe(ron.makePen()));
    ron.plot(cv, q.value);
  },
  setup: (cv) => {
    const queue = ron.pipe(ron.makePen())
      .to(ron.bg, { color: ron.rgb(0xff, 0xf7, 0xf0) })
      .to(ron.bm, { op: 'multiply' })
    ron.plot(cv, queue.value)
  }
})
