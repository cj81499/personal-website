const directoryOutputPlugin = require("@11ty/eleventy-plugin-directory-output");

const SRC_DIR = "src";

module.exports = function (eleventyConfig) {
  // https://www.11ty.dev/docs/plugins/directory-output/
  eleventyConfig.setQuietMode(true);
  eleventyConfig.addPlugin(directoryOutputPlugin);

  // TODO: use eleventy image plugin https://www.11ty.dev/docs/plugins/image/
  eleventyConfig.addPassthroughCopy(`${SRC_DIR}/assets/images`);
  eleventyConfig.addPassthroughCopy(`${SRC_DIR}/assets/styles`);

  return {
    dir: {
      input: SRC_DIR,
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
  };
};
