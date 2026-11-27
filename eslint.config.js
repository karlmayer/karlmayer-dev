export default [
    {
        ignores: ["dist/", ".astro/", "node_modules/"],
    },
    {
        files: ["**/*.js", "**/*.mjs"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                console: "readonly",
                process: "readonly",
                fetch: "readonly",
                AbortSignal: "readonly",
                URL: "readonly",
            },
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error",
            "eqeqeq": "error",
            "no-var": "error",
            "prefer-const": "warn",
        },
    },
];
