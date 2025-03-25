const path = require("path");
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
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
                        presets: ["@babel/preset-env"], // Preset per compatibilità con ES
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
                use: ["html-loader"], // Gestisce il caricamento degli HTML
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'], // Gestisce i file CSS
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(), // Pulisce la cartella dist prima della build
        new WebpackShellPluginNext({
            onAfterEmit: {
                scripts: ['npm run jsdoc'], // Usa npm per eseguire lo script di documentazione
                blocking: false,
                parallel: false
            }
        })
    ],
    devServer: {
        static: "./dist", // Cartella static dove Webpack servirà i file
        port: 3000, // Porta di sviluppo
        open: true, // Apre automaticamente il browser
    },
    mode: "production", // Modalità di produzione
};
