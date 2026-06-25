const jestGlobals = {
  jest:       "readonly",
  describe:   "readonly",
  it:         "readonly",
  test:       "readonly",
  expect:     "readonly",
  beforeEach: "readonly",
  afterEach:  "readonly",
  beforeAll:  "readonly",
  afterAll:   "readonly",
};

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

// Allow _-prefixed vars to be unused (standard convention for intentionally ignored destructured values)
const noUnusedVarsRule = ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }];

module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType:  "commonjs",
      globals:     nodeGlobals
    },
    rules: {
      "no-undef":      "error",
      "no-unused-vars": ["warn", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
      "no-unreachable":"error",
      "no-undef-init": "error"
    }
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType:  "commonjs",
      globals:     {}
    },
    rules: {
      "no-undef":      "error",
      "no-unused-vars": noUnusedVarsRule,
      "no-unreachable":"error",
      "no-undef-init": "error"
    }
  },
  {
    files: ["**/*.test.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType:  "commonjs",
      globals:     { ...nodeGlobals, ...jestGlobals }
    },
    rules: {
      "no-undef":      "error",
      "no-unused-vars": ["warn", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
      "no-unreachable":"error",
      "no-undef-init": "error"
    }
  }
];
