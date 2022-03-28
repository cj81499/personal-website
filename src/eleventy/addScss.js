const sass = require("sass");
const path = require("node:path");

function addScss(eleventyConfig) {
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",

    compile: async function (inputContent, inputPath) {
      console.log(inputPath);
      const parsed = path.parse(inputPath);

      if (parsed.name.startsWith("_")) {
        return;
      }

      const result = await sass.compileStringAsync(inputContent, {
        loadPaths: [parsed.dir || ".", this.config.dir.includes],
        // TODO: source maps
      });

      return (data) => {
        return result.css;
      };
    },
  });
}

exports.addScss = addScss;
