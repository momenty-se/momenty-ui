#!/usr/bin/env node
/**
 * Byter Flows klassnamn mot paketets, i className-strängar och ingenting annat.
 *
 * VARFÖR INTE SED. Två fällor som båda ser ut att fungera tills man tittar:
 *
 *   1. `\b` finns inte i BSD sed, som är den macOS kör. `s/flow-btn--text\b/…/`
 *      matchar aldrig, tyst, och man tror att klassen inte fanns.
 *   2. Att städa dubbla mellanslag efteråt med `s/ "/"/g` klistrar ihop
 *      JSX-attribut: `id="a" className="x"` blir `id="a"className="x"`.
 *      Och en regel som kollapsar mellanslagssekvenser plattar samtidigt all
 *      indentering i filen.
 *
 * Skriptet rör bara innehållet i className="…" och className={"…"}, kollapsar
 * mellanslag inuti just den strängen, och lämnar resten av filen orörd.
 *
 *   node scripts/migrera-klasser.mjs --etapp=button  ../momenty-flow/src
 *   node scripts/migrera-klasser.mjs --etapp=field   ../momenty-flow/src
 *
 * Utan `--skriv` är körningen en torrkörning som bara rapporterar.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Längsta namn först — annars äter `flow-btn` prefixet i `flow-btn--varning`. */
const ETAPPER = {
  button: [
    ["flow-btn--destructive-fylld", "mo-btn--destructive-solid"],
    ["flow-btn--texts", ""], // stavfel, har aldrig matchat en regel
    ["flow-btn--text", "mo-btn--quiet"], // gammalt namn för quiet
    ["flow-btn--varning", "mo-btn--warn"],
    ["flow-btn--sm", ""], // avvecklad, regeln är tom sedan tidigare
    ["flow-icon-btn--glas", "mo-icon-btn--glass"],
    ["flow-icon-btn", "mo-icon-btn"],
    ["flow-btn", "mo-btn"],
  ],
  field: [
    ["flow-field-etikett", "mo-label"],
    ["flow-field-hjalp", "mo-hint"],
    ["flow-field-fel", "mo-field-error"],
    ["flow-field-knapp", "mo-field-button"],
    ["flow-field--inmatning", "mo-field--plain"],
    ["flow-field--last", "mo-field--locked"],
    ["flow-field--fel", "mo-field--invalid"],
    ["flow-input--piller", "mo-input--pill"],
    ["flow-input--belopp", "mo-input--amount"],
    ["flow-input--fel", "mo-input--invalid"],
    ["flow-textarea--fel", "mo-textarea--invalid"],
    ["flow-field", "mo-field"],
    ["flow-input", "mo-input"],
    ["flow-textarea", "mo-textarea"],
  ],
};

/**
 * Filer som ska lämnas i fred. ThemeToggle bär `flow-icon-btn--kant`, en
 * variant paketet inte har, och komponenten migreras inte i den här omgången
 * eftersom den hänger ihop med Flows egen ThemeProvider.
 */
const UNDANTAG = ["ThemeToggle.tsx"];

function filer(rot) {
  const ut = [];
  for (const post of readdirSync(rot)) {
    if (post === "node_modules" || post.startsWith(".")) continue;
    const bana = join(rot, post);
    if (statSync(bana).isDirectory()) ut.push(...filer(bana));
    else if (post.endsWith(".tsx") && !UNDANTAG.includes(post)) ut.push(bana);
  }
  return ut;
}

/** Ersätter inuti en className-sträng och städar mellanrummen som blir kvar. */
function bytKlasser(strang, par) {
  let ut = strang;
  for (const [fran, till] of par) ut = ut.split(fran).join(till);
  return ut.replace(/\s+/g, " ").trim();
}

const argv = process.argv.slice(2);
const etapp = argv.find((a) => a.startsWith("--etapp="))?.split("=")[1];
const skriv = argv.includes("--skriv");
const rot = argv.find((a) => !a.startsWith("--"));

if (!etapp || !ETAPPER[etapp] || !rot) {
  console.error("Användning: migrera-klasser.mjs --etapp=button|field [--skriv] <src-katalog>");
  process.exit(1);
}

const par = ETAPPER[etapp];
const mönster = /className=(?:"([^"]*)"|\{"([^"]*)"\})/g;
let rörda = 0;
let byten = 0;

for (const bana of filer(rot)) {
  const före = readFileSync(bana, "utf8");
  let filByten = 0;

  const efter = före.replace(mönster, (hel, dubbel, klammer) => {
    const original = dubbel ?? klammer;
    const ny = bytKlasser(original, par);
    if (ny === original) return hel;
    filByten++;
    return dubbel !== undefined ? `className="${ny}"` : `className={"${ny}"}`;
  });

  if (filByten > 0) {
    rörda++;
    byten += filByten;
    if (skriv) writeFileSync(bana, efter);
    console.log(`${filByten.toString().padStart(3)}  ${bana}`);
  }
}

console.log(
  `\n${byten} className-strängar i ${rörda} filer${skriv ? " skrivna" : " (torrkörning — lägg till --skriv)"}.`,
);
