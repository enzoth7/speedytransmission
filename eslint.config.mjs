import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: "JSXOpeningElement[name.name='span']", message: "<span> está prohibido en este proyecto." },
        { selector: "JSXOpeningElement[name.name='p']", message: "<p> está prohibido en este proyecto." },
        { selector: "JSXAttribute[name.name='eyebrow']", message: "Los eyebrows están prohibidos en este proyecto." },
      ],
    },
  },
  globalIgnores([".next/**", "coverage/**", "playwright-report/**", "test-results/**"]),
]);
