import dirOutputPlugin from "@11ty/eleventy-plugin-directory-output";
import faviconPlugin from "./src/_plugins/favicon.js";

const SRC_DIR = "src";
const OUTPUT_DIR = "_site";

/** @param {import('@11ty/eleventy/UserConfig').default} eleventyConfig */
export default async function (eleventyConfig) {
  // https://www.11ty.dev/docs/plugins/directory-output/
  eleventyConfig.setQuietMode(true);
  eleventyConfig.addPlugin(dirOutputPlugin);

  eleventyConfig.addPlugin(faviconPlugin, {
    // The page's own profile photo, so the icon follows whenever it is replaced.
    source: `${SRC_DIR}/static/images/profile.png`,
    outputDir: OUTPUT_DIR,
  });

  eleventyConfig.addPassthroughCopy(`${SRC_DIR}/static`);

  return {
    dir: {
      input: SRC_DIR,
      output: OUTPUT_DIR,
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
  };
}
