// https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
//
// inspo:
// - https://www.npmjs.com/package/eleventy-favicon
// - https://www.npmjs.com/package/eleventy-plugin-gen-favicons
//
// Three of the article's six files are deliberately skipped. It recommends
// icon-192.png, icon-512.png and a webmanifest listing them, all of which exist
// to make a site installable as a PWA. This site is not meant to be installed,
// and a manifest carrying icons but none of the name / start_url / display
// fields Chrome's install criteria require would not make it installable
// anyway -- so emitting them would mean encoding ~525KB per build that nothing
// reads. The article's SVG icon is skipped for a different reason; see the TODO
// beside the shortcode.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// The source is the profile photo the page already displays. Geometry below
// reproduces the framing of the Figma export this replaced: in its 160-unit
// viewBox the ring sat at r=79 with stroke-width=2 and the photo was drawn into
// a 250-unit square at (-42, -33), so both the ring and the crop scale as
// fractions rather than pixels. A replacement photo of similar framing works as
// is; one framed differently needs CROP retuned.
const RING_RADIUS_RATIO = 79 / 160;
const RING_WIDTH_RATIO = 2 / 160;
const RING_COLOR = "#F1F1F1";

// Zooms past the shoulders so the face still reads at 32px.
const CROP = { left: 366 / 2180, top: 288 / 2180, size: 1395 / 2180 };

const ICO_SIZE = 32;
const APPLE_TOUCH_SIZE = 180;

// Encoded truecolor. 256-color quantization would save ~62KB across the two
// icons, but the faint red bleacher logo in the background sits close enough to
// the blue-grey around it that the quantizer folds the two together and the
// shape stops existing. A coherent few-unit hue shift across a whole feature is
// near-invisible to mean-difference metrics and obvious to the eye.

/** Clips `size`-square content to a circle and strokes the ring over it. */
function circleOverlays(size) {
  const center = size / 2;
  const ringWidth = size * RING_WIDTH_RATIO;
  const ringRadius = size * RING_RADIUS_RATIO;
  const svg = (contents) =>
    Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${contents}</svg>`);

  return [
    {
      input: svg(`<circle cx="${center}" cy="${center}" r="${center}" fill="#fff"/>`),
      blend: "dest-in",
    },
    {
      input: svg(
        `<circle cx="${center}" cy="${center}" r="${ringRadius}" fill="none" stroke="${RING_COLOR}" stroke-width="${ringWidth}"/>`,
      ),
      blend: "over",
    },
  ];
}

/** Resolves CROP against the source's own dimensions. */
async function cropRegion(source) {
  const { width, height } = await sharp(source).metadata();
  const size = Math.round(Math.min(width, height) * CROP.size);
  return {
    left: Math.round(width * CROP.left),
    top: Math.round(height * CROP.top),
    width: size,
    height: size,
  };
}

function round(framed, size) {
  return framed().resize(size, size).composite(circleOverlays(size)).png();
}

/**
 * Wraps a single PNG in an ICO container: a 6-byte ICONDIR, one 16-byte
 * ICONDIRENTRY, then the PNG bytes. Embedding PNG rather than BMP is supported
 * by every browser that still asks for /favicon.ico.
 */
function pngToIco(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size, 6); // width
  header.writeUInt8(size, 7); // height
  header.writeUInt8(0, 8); // palette size: not paletted
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // color planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(header.length, 18); // offset to the PNG
  return Buffer.concat([header, png]);
}

/**
 * @param {import('@11ty/eleventy/UserConfig').default} eleventyConfig
 * @param {{ source: string }} options
 */
export default function (eleventyConfig, { source }) {
  eleventyConfig.addWatchTarget(source);

  eleventyConfig.on("eleventy.before", async () => {
    // Read per build rather than at registration so `--output` is honored;
    // Eleventy resolves it before plugins run, but only the build knows the
    // final value.
    const outputDir = eleventyConfig.directories.output;
    await fs.mkdir(outputDir, { recursive: true });
    const out = (file) => path.join(outputDir, file);

    const region = await cropRegion(source);
    const framed = () => sharp(source).extract(region);

    await Promise.all([
      // iOS composites apple-touch-icon onto its own rounded-rect mask and
      // renders any transparency as black, so this one stays square and opaque.
      framed().resize(APPLE_TOUCH_SIZE, APPLE_TOUCH_SIZE).flatten().png().toFile(out("apple-touch-icon.png")),

      round(framed, ICO_SIZE)
        .toBuffer()
        .then((png) => fs.writeFile(out("favicon.ico"), pngToIco(png, ICO_SIZE))),
    ]);
  });

  // TODO: serve an SVG icon once there's a real vector asset to serve.
  // A vector mark would render crisply at every size in ~1KB, which is the one
  // thing this PNG pipeline cannot do. It belongs here as:
  //   <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  // Deliberately omitted for now: the only available artwork is a photograph,
  // and wrapping a raster payload in SVG costs a base64 tax for no sharpness.
  eleventyConfig.addShortcode("favicons", () =>
    [
      `<link rel="icon" href="/favicon.ico" sizes="${ICO_SIZE}x${ICO_SIZE}" />`,
      `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
    ].join("\n    "),
  );
}
