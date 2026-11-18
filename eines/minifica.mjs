// Redueix CSS i JS (eliminant espais i comentaris) per carregar la web més ràpid.
// S'executa des de construeix.py si hi ha Node.js i s'ha fet "npm install".
import { minify } from "terser";
import { transform } from "lightningcss";
import { readFileSync, writeFileSync } from "node:fs";
const js = ["js/app.js", "js/traduccions.js", "js/config.js"];
for (const f of js) {
  const r = await minify(readFileSync(f, "utf8"), { compress: { passes: 2 }, mangle: true, format: { comments: false } });
  writeFileSync(f.replace(/\.js$/, ".min.js"), r.code + "\n");
}
const css = transform({ filename: "estil.css", code: readFileSync("css/estil.css"), minify: true,
  targets: { chrome: 100 << 16, firefox: 100 << 16, safari: 15 << 16 } });
writeFileSync("css/estil.min.css", css.code);
console.log("CSS i JS reduïts");
