# ajnor

ajnor is an open-source creative-coding toolkit for JavaScript.

It is lightweight, functional and fast.
It allows you to create your starry nightsky in squint.

Currently the following commands are supported:
- Background (bg)
- Rectangle (rect)
- Circle (circle)
- BlendMode (bm)

![Organic sketch, rectangles jumping around](./docs/x-organic.png)

## Requirement
**ajnor** requires a browser that supports ECMAScript modules.

## How to use
ajnor is lightweight and modular and is written in modern JavaScript.

Use it directly by downloading it from [GitHub](https://github.com/birdboat00/ajnor):
```js
import { ... } from "/path/to/ajnor/mod.mjs"
```

or import it from jsDelivr:
```js
import { ... } from "https://cdn.jsdelivr.net/gh/birdboat00/ajnor/src/mod.mjs"
```

Draw a rectangle:
```js
import { canvas, makePen, pipe, plot, rect, cols } from "/path/to/ajnor/mod.mjs"

const cv = canvas(400, 400)
const draw = () => {
  const queue = pipe(makePen())
    .to(bg, { color: cols.colblack() })
    .to(rect, {x: 20, y: 20, w: 360, h: 360, fill: cols.colwhite() })
  plot(cv, queue.value);
  requestAnimationFrame(draw)
}
requestAnimationFrame(draw)
```

## Disclaimer
I just started working on this library and there is still a lot of work to
be done. Feel free to help out!

## License
ajnor is licensed under the MIT license.
