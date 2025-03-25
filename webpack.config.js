const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    entry: "./index.js", // Punto di ingresso
    output: {
        filename: "tooEasyRial.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/dist/",
        libraryTarget: "module", // Usa "module" per il modulo ES
    },
    experiments: {
        outputModule: true, // Necessario per il supporto ai moduli ES
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // Inietta il CSS nel JS
                    "css-loader", // Gestisce il CSS
                    "sass-loader", // Compila il SCSS in CSS
                ],
            },
            {
                test: /\.html$/,
                use: ["html-loader"],
            },
        ],
    },
    plugins: [new CleanWebpackPlugin()],
    devServer: {
        static: "./dist",
        port: 3000,
        open: true,
    },
    mode: "production",
};
