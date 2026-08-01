import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import dirOutputPlugin from "@11ty/eleventy-plugin-directory-output";
import faviconsPlugin from "eleventy-plugin-gen-favicons";

const SRC_DIR = "src";
const OUTPUT_DIR = "_site";

/** @param {import('@11ty/eleventy/UserConfig').default} eleventyConfig */
export default async function (eleventyConfig) {
  // https://www.11ty.dev/docs/plugins/directory-output/
  eleventyConfig.setQuietMode(true);
  eleventyConfig.addPlugin(dirOutputPlugin);

  eleventyConfig.addPlugin(eleventyImageTransformPlugin);

  eleventyConfig.addPlugin(faviconsPlugin, { outputDir: OUTPUT_DIR });

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
