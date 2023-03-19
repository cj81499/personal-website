const directoryOutputPlugin = require("@11ty/eleventy-plugin-directory-output");
const faviconsPlugin = require("eleventy-plugin-gen-favicons");

const SRC_DIR = "src";
const OUTPUT_DIR = "_site";

module.exports = function (eleventyConfig) {
  // https://www.11ty.dev/docs/plugins/directory-output/
  eleventyConfig.setQuietMode(true);
  eleventyConfig.addPlugin(directoryOutputPlugin);

  // https://www.npmjs.com/package/eleventy-plugin-gen-favicons
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
};
