const { stripTypeScriptTypes } = require("node:module");

module.exports = {
  process(sourceText, sourcePath) {
    return {
      code: stripTypeScriptTypes(sourceText, {
        mode: "strip",
        sourceUrl: sourcePath,
      }),
    };
  },
};
