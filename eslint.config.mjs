import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    ignores: [
      "components/ui/**/*.{ts,tsx}",
      "components/quote/**/*.{ts,tsx}",
      "components/kanban/**/*.{ts,tsx}",
      "components/search/filters/**/*.{ts,tsx}",
      "components/packages/PackagesBrowse.tsx",
      "components/request/RequestDetail.tsx",
      "components/showcase/DesignSystemPlayground.tsx",
      "app/error.tsx",
      "app/global-error.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXOpeningElement[name.name='input']:not(:has(JSXAttribute[name.name='type'][value.value='hidden'])):not(:has(JSXAttribute[name.name='type'][value.value='range'])):not(:has(JSXAttribute[name.name='type'][value.value='checkbox'])):not(:has(JSXAttribute[name.name='type'][value.value='radio']))",
          message:
            "Use design-system primitives from components/ui (Input, Checkbox, Radio, Switch, Slider) instead of raw <input>.",
        },
        {
          selector: "JSXOpeningElement[name.name='select']",
          message:
            "Use the design-system Select primitive from components/ui instead of raw <select>.",
        },
        {
          selector: "JSXOpeningElement[name.name='textarea']",
          message:
            "Use the design-system Textarea primitive from components/ui instead of raw <textarea>.",
        },
        {
          selector: "JSXOpeningElement[name.name='button']",
          message:
            "Use the design-system Button primitive from components/ui instead of raw <button>.",
        },
      ],
    },
  },
];

export default eslintConfig;
