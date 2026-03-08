module.exports = [
    {
        files: [".eleventy.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                require: "readonly",
                module: "readonly",
                exports: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                console: "readonly",
                process: "readonly",
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error",
            "eqeqeq": "error",
            "no-var": "error",
            "prefer-const": "warn",
        }
    }
];
