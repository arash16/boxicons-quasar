const { parse } = require('svg-parser');

const pathToString = path => path
  .map(x => x[0] + x.slice(1).join(' '))
  .join('');

// https://github.com/thednp/svg-path-commander/blob/master/src/util/shapeToPath.ts
const converters = {
  path: ({ d }) => d,
  circle: ({ cx, cy, r }) => pathToString([
    ['M', cx - r, cy],
    ['a', r, r, 0, 1, 0, 2 * r, 0],
    ['a', r, r, 0, 1, 0, -2 * r, 0],
  ]),
  ellipse: ({ cx, cy, rx, ry }) => pathToString([
    ['M', cx - rx, cy],
    ['a', rx, ry, 0, 1, 0, 2 * rx, 0],
    ['a', rx, ry, 0, 1, 0, -2 * rx, 0],
  ]),
  rect: attr => {
    const x = +attr.x || 0;
    const y = +attr.y || 0;
    const w = +attr.width;
    const h = +attr.height;
    let rx = +attr.rx;
    let ry = +attr.ry;

    // Validity checks from http://www.w3.org/TR/SVG/shapes.html#RectElement:
    if (rx || ry) {
      rx = !rx ? ry : rx;
      ry = !ry ? rx : ry;
      if (rx * 2 > w) rx -= (rx * 2 - w) / 2;
      if (ry * 2 > h) ry -= (ry * 2 - h) / 2;

      return pathToString([
        ['M', x + rx, y],
        ['h', w - rx * 2],
        ['s', rx, 0, rx, ry],
        ['v', h - ry * 2],
        ['s', 0, ry, -rx, ry],
        ['h', -w + rx * 2],
        ['s', -rx, 0, -rx, -ry],
        ['v', -h + ry * 2],
        ['s', 0, -ry, rx, -ry],
      ]);
    }

    return pathToString([['M', x, y], ['h', w], ['v', h], ['H', x], ['Z']]);
  }
}

module.exports = function convert(svg, id) {
  const { children: [root] } = parse(svg);
  if (root.properties.viewBox !== '0 0 24 24') {
    throw new Error('Invalid viewbox!');
  }

  const parts = [];
  for (const item of root.children) {
    if (!converters[item.tagName]) {
      throw new Error('Unknown tag', item.tagName);
    }

    parts.push(converters[item.tagName](item.properties));
  }
  return parts.join('&&');
}
