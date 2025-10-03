import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
import jestPlugin from "eslint-plugin-jest";
import globals from "globals";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/out/**",
      "**/coverage/**",
      "pocketbase/pb_data/**",
      "pocketbase/pb_migrations/**",
      "**/*.d.ts"
    ]
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js}"],

    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
      jest: jestPlugin
    },

    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...prettier.rules,
      "no-unused-vars": "warn",
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    files: ["**/*.test.{js,ts,tsx}", "**/__tests__/**/*.{js,ts,tsx}"],
    languageOptions: {
      globals: jestPlugin.environments.globals.globals
    },
    rules: {
      ...jestPlugin.configs.recommended.rules
    }
  }
];
