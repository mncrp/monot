import { defineConfig } from "eslint/config";
import node from "eslint-plugin-node";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("eslint:recommended", "plugin:node/recommended"),

    plugins: {
        node,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
            ...globals.commonjs,
            node: false,
        },

        ecmaVersion: 2022,
        sourceType: "commonjs",
    },

    rules: {
        "node/no-unpublished-require": "off",
        "no-unused-vars": "warn",
        indent: ["error", 2],
        "linebreak-style": ["error", "unix"],

        quotes: ["error", "single", {
            avoidEscape: true,
            allowTemplateLiterals: true,
        }],

        semi: ["error", "always"],
        "array-bracket-spacing": ["error", "never"],
        "block-spacing": ["error", "never"],
        "brace-style": "error",
        camelcase: "error",

        "comma-spacing": ["error", {
            before: false,
            after: true,
        }],

        "comma-style": ["error", "last"],
        "computed-property-spacing": ["error", "never"],
        "eol-last": "error",

        "key-spacing": ["error", {
            beforeColon: false,
            afterColon: true,
        }],

        "no-lonely-if": "error",

        "no-multiple-empty-lines": ["error", {
            max: 1,
        }],

        "no-nested-ternary": "error",
        "func-call-spacing": ["error", "never"],
        "no-trailing-spaces": "error",
        "no-unneeded-ternary": "error",
        "object-curly-spacing": ["error", "never"],
        "operator-linebreak": ["error", "after"],
        "semi-spacing": "error",

        "keyword-spacing": ["error", {
            after: true,
        }],

        "space-before-blocks": "error",
        "space-before-function-paren": ["error", "never"],
        "space-in-parens": ["error", "never"],
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "spaced-comment": ["error", "always"],
        "no-empty-character-class": "error",
        "no-extra-boolean-cast": "error",
        "arrow-spacing": "error",
        "no-var": "error",
        "prefer-arrow-callback": "error",
        "prefer-const": "warn",
        "prefer-template": "error",
        "consistent-return": "error",
        "dot-notation": "error",
        eqeqeq: ["error", "smart"],
        "no-else-return": "error",
        "no-floating-decimal": "error",
        "no-implicit-coercion": "error",
        "no-loop-func": "error",
        "no-multi-spaces": "error",
        "no-new": "error",
        "no-octal-escape": "error",
        "no-return-assign": ["error", "always"],
        "no-self-compare": "error",
        "no-useless-concat": "error",
        yoda: "error",
    },
}]);