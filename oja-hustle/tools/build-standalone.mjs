// Builds dist/oja-hustle-standalone.html: the whole game in ONE file
// (code, styles and fonts inside). Double-click it to play, or send it to anyone.
//   npm install   (once)
//   npm run standalone
import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const www = new URL("../www/", import.meta.url).pathname;
const out = new URL("../dist/", import.meta.url).pathname;

const js = await build({ entryPoints: [www + "js/main.js"], bundle: true, format: "iife", minify: true, write: false, target: "es2019" });
let css = await readFile(www + "css/style.css", "utf8");
for (const f of ["Poppins-Regular", "Poppins-Medium", "Poppins-Bold"]) {
  const b64 = (await readFile(`${www}fonts/${f}.ttf`)).toString("base64");
  css = css.replace(`url("../fonts/${f}.ttf")`, `url(data:font/ttf;base64,${b64})`);
}
const icon = (await readFile(www + "icons/icon-192.png")).toString("base64");
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<title>Oja Hustle</title><meta name="theme-color" content="#7B3FE4">
<link rel="icon" href="data:image/png;base64,${icon}">
<style>${css}</style></head>
<body><div class="shell"><main class="app" id="app" aria-live="polite"></main></div>
<script>window.OJA_STANDALONE = true;</script>
<script>${js.outputFiles[0].text.replace(/<\/script/g, "<\\/script")}</script></body></html>`;
await mkdir(out, { recursive: true });
await writeFile(out + "oja-hustle-standalone.html", html);
console.log("Built dist/oja-hustle-standalone.html", Math.round(html.length / 1024) + " KB");
