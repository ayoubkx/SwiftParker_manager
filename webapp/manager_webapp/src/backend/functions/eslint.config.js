// eslint.config.js
import js from "@eslint/js";
import globals from "globals";

export default [
    {
        files: ["**/*.js"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
            ecmaVersion: 2022,
            sourceType: "module",
        },
        rules: {
            indent: ["error", 4],
            quotes: ["error", "double"],
            "comma-dangle": ["error", "always-multiline"],
            "arrow-parens": ["error", "always"],
            "object-curly-spacing": ["error", "never"],
            semi: ["error", "always"],
            "no-trailing-spaces": "error",
            "eol-last": "error",
        },
    },
];
