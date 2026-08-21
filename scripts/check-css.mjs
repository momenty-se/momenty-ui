#!/usr/bin/env node
/**
 * Spärrar för CSS:en. Körs av `npm run check`.
 *
 * VARFÖR DEN FINNS. Under bygget av paketet fångades två fel som varken `tsc`
 * eller en grep hittade, och som bara syntes när Vite försökte bygga:
 *
 *   1. Ett CSS-block klipptes ur momenty-flow på fel radnummer, så filen
 *      började mitt i en annan regel. En klammerräknare säger "balanserad"
 *      om antalet `{` och `}` går jämnt ut — även när ordningen är fel.
 *   2. En klass sattes i TSX utan att någon regel matchade den. Den syns inte
 *      som ett fel någonstans; komponenten renderas bara utan sin form.
 *
 * Den här filen gör båda till ett rött kryss i stället för en överraskning.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postcss from "postcss";

const ROT = new URL("..", import.meta.url).pathname;
const CSS_DIR = join(ROT, "src/css");
const KOMP_DIR = join(ROT, "src/components");

let fel = 0;
const klagomål = (rad) => {
  console.error(`  ✗ ${rad}`);
  fel++;
};

/* --- 1. Parsar varje fil? --------------------------------------------- */
const cssFiler = readdirSync(CSS_DIR).filter((f) => f.endsWith(".css"));
const allCss = [];
for (const f of cssFiler) {
  const text = readFileSync(join(CSS_DIR, f), "utf8");
  allCss.push(text);
  try {
    postcss.parse(text, { from: f });
  } catch (e) {
    klagomål(`${f}: ${e.message}`);
  }
}
const css = allCss.join("\n");

/* --- 2. Har varje klass i markup en regel? ---------------------------- */
const definierade = new Set([...css.matchAll(/\.(mo-[a-z0-9-]+)/g)].map((m) => m[1]));

const satta = new Set();
for (const f of readdirSync(KOMP_DIR).filter((f) => /\.tsx?$/.test(f))) {
  const text = readFileSync(join(KOMP_DIR, f), "utf8");
  // className="…", className={[…]} och className={`…${x}`} — den sista bara
  // för de statiska delarna, eftersom en interpolerad modifierare inte går
  // att lösa ut här. De täcks av att basklassen finns.
  for (const m of text.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{\[([^\]]*)\])/g)) {
    for (const k of (m[1] ?? m[2] ?? m[3] ?? "").matchAll(/\bmo-[a-z0-9-]+\b/g)) {
      satta.add(k[0]);
    }
  }
}
for (const k of [...satta].sort()) {
  if (!definierade.has(k)) klagomål(`klassen .${k} sätts i markup men har ingen CSS-regel`);
}

/* --- 3. Är varje token definierad? ------------------------------------ */
const tokensDef = new Set(
  [...readFileSync(join(CSS_DIR, "tokens.css"), "utf8").matchAll(/^\s*(--mo-[a-z0-9-]+):/gm)].map((m) => m[1]),
);
for (const m of css.matchAll(/var\((--mo-[a-z0-9-]+)(\s*,)?/g)) {
  // Med fallback är en odefinierad token ett medvetet val — `--mo-btn-weight`
  // sätts bara av en app som vill göra undantag.
  if (!tokensDef.has(m[1]) && !m[2]) klagomål(`token ${m[1]} används utan att vara definierad eller ha fallback`);
}

/* --- 4. Ingen Tailwind i markup --------------------------------------- */
const TAILWIND =
  /\b(flex|block|hidden|contents|w-full|h-full|ml-auto|truncate|tabular-nums|shrink-0|min-w-0|flex-1|items-[a-z]+|justify-[a-z]+|gap-[\d.]+|p[xytblr]?-[\d.]+|m[xytblr]?-[\d.]+|text-(?:xs|sm|base|lg|xl)|rounded-[a-z]+|animate-[a-z]+|scroll-mt-\d+|opacity-\d+)\b/;
for (const f of readdirSync(KOMP_DIR).filter((f) => /\.tsx$/.test(f))) {
  const text = readFileSync(join(KOMP_DIR, f), "utf8");
  for (const m of text.matchAll(/className="([^"]*)"/g)) {
    const träff = m[1].match(TAILWIND);
    if (träff) klagomål(`${f}: Tailwind-klassen "${träff[0]}" i markup — paketet får inte bero på Tailwind`);
  }
}

console.log(
  fel === 0
    ? `✓ ${cssFiler.length} CSS-filer, ${definierade.size} klasser, ${tokensDef.size} tokens — allt hänger ihop`
    : `\n${fel} problem.`,
);
process.exit(fel === 0 ? 0 : 1);
