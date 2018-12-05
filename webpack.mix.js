"use strict";

const mix = require("laravel-mix");
const tailwindcss = require("tailwindcss");
const glob = require("glob-all");
// const PurgecssPlugin = require("purgecss-webpack-plugin");
const colorFunction = require("postcss-color-function");
const autoprefixer = require("autoprefixer");
const momentumScrolling = require("postcss-momentum-scrolling");

const PATHS = {
  src    : path.join(__dirname, "src"),
  public : path.join(__dirname, "public")
};

/**
 * Custom PurgeCSS Extractor
 * https://github.com/FullHuman/purgecss
 * https://github.com/FullHuman/purgecss-webpack-plugin
 */
class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:\/]+/g);
  }
}

mix.webpackConfig({
  node: {
    fs: "empty",
    tls: "empty",
    net: "empty"
  }
});

mix
  .react("src/client/index.jsx", "public/static/js/bundle.js")
  .sass("src/assets/scss/tailwind.scss", "public/static/stylesheets/bundle.css")
  .options({
    postCss: [
      tailwindcss("tailwind.js"),
      colorFunction(),
      autoprefixer(),
      momentumScrolling([
        "hidden",
        "scroll",
        "auto",
        "inherit"
      ])
    ],
    processCssUrls: false
  })
  .browserSync({
    proxy: "localhost:3000",
    port: 8080,
    ghostMode: false,
    files: [
      "public/static/js/bundle.js",
      "public/static/stylesheets/bundle.css"
    ]
  });

// mix.sass("node_modules/aos/src/sass/aos.scss", "public/css/aos.css");

// mix.webpackConfig({
//   plugins: [
//     new PurgecssPlugin({
//       paths: glob.sync([
//         `${PATHS.src}/**/*.jsx`,
//         `${PATHS.src}/**/*.js`,
//         `${PATHS.src}/**/*.ejs`,
//       ], { nodir: true }),
//       whitelistPatterns: [/^aos/],
//       extractors: [
//         {
//           extractor: TailwindExtractor,
//           extensions: ["js", "jsx", "ejs"]
//         }
//       ]
//     })
//   ]
// });
