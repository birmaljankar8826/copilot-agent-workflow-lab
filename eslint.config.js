const nodeGlobals = {
  console:      "readonly",
  process:      "readonly",
  require:      "readonly",
  module:       "readonly",
  exports:      "readonly",
  __dirname:    "readonly",
  __filename:   "readonly",
  Buffer:       "readonly",
  setTimeout:   "readonly",
  clearTimeout: "readonly",
  setInterval:  "readonly",
  clearInterval:"readonly",
  global:       "readonly",
};

module.exports = [
  // Default: ALL JS files — basic rules, Node.js globals allowed
  // Covers any new directory added in the future (utils/, lib/, api/, etc.)
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType:  "commonjs",
      globals:     nodeGlobals
    },
    rules: {
      "no-undef":      "error",
      "no-unused-vars":"warn",
      "no-unreachable":"error",
      "no-undef-init": "error"
    }
  },
  // Override for src/ — stricter, no Node.js globals
  // so undefined app variables like `multi`, `users` are flagged as bugs
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType:  "commonjs",
      globals:     {}
    },
    rules: {
      "no-undef":      "error",
      "no-unused-vars":"error",
      "no-unreachable":"error",
      "no-undef-init": "error"
    }
  }
];
