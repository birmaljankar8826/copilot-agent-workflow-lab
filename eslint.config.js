const nodeGlobals = {
  console:     "readonly",
  process:     "readonly",
  require:     "readonly",
  module:      "readonly",
  exports:     "readonly",
  __dirname:   "readonly",
  __filename:  "readonly",
  Buffer:      "readonly",
  setTimeout:  "readonly",
  clearTimeout:"readonly",
  setInterval: "readonly",
  clearInterval:"readonly",
  global:      "readonly",
};

module.exports = [
  // src/ — strict, no globals: catches undefined vars like `multi`, `users`
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs"
    },
    rules: {
      "no-undef":      "error",
      "no-unused-vars":"error",
      "no-unreachable":"error",
      "no-undef-init": "error"
    }
  },
  // scripts/ — Node.js globals allowed: console, process, require, etc.
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: nodeGlobals
    },
    rules: {
      "no-undef":      "error",
      "no-unused-vars":"warn",
      "no-unreachable":"error",
      "no-undef-init": "error"
    }
  }
];
