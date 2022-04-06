import * as ron from "./src/mod.mjs"

ron.defsketch({
  size: ron.szsquare(1000),
  title: "x-organic",
  view: (cv) => {
    const p = cv.w / ron.rndrn(70, 1000);
    const l = (i, c) => {
      return ((i < cv.h * 2)
        ? () => {
          const x = cv.w / 2 + (Math.tan(i) * i) / (p * 2)
          const y = cv.h - i
          const hue = ron.maprn(p, cv.h / 1000, cv.w / 70, 130, 50)
          const q = c.to(ron.rect, {
            x, y, w: p, h: p, color: ron.hsb(hue, 50, 65)
          })
          return l(i + p, q)
        }
        : () => c
      )();
    }
    ron.plot(cv, l(0, ron.pipe(ron.mkpen())).value);
  },
  setup: (cv) => {
    const queue = ron.pipe(ron.mkpen())
      .to(ron.bg, { color: ron.rgb(0xff, 0xf7, 0xf0) })
      .to(ron.bm, { op: 'multiply' })
    ron.plot(cv, queue.value)
  }
})
