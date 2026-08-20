# Migrering till @momenty/ui

Skriven mot momenty-flow, som migrerar först. Siffrorna är mätta i repot
2026-08-20, inte uppskattade. Nästa app följer samma ordning.

## Ordningen är vald efter risk, inte efter storlek

| Etapp | Vad                       | Filer med import | className-strängar | CSS berörd |
| ----- | ------------------------- | ---------------- | ------------------ | ---------- |
| 1     | `Icon`                    | 111              | 0                  | ingen      |
| 2     | Infrastruktur             | —                | —                  | layout     |
| 3     | `Button`                  | 75               | 92 i 46 filer      | button.css |
| 4     | `Input` `Textarea` `Field`| 51               | 60 i 30 filer      | field.css  |

Sammanlagt berörs 131 unika filer av importbytena. Siffrorna för
className-strängar är torrkörda med `scripts/migrera-klasser.mjs`, inte
grepade — grep räknar varje klassnamn, skriptet räknar de strängar som
faktiskt ändras.

Etapp 1 är riskfri och bör göras först även om resten skjuts upp: `Icon` har
ingen CSS alls, så det enda som kan gå fel är en importsökväg — och det syns
direkt i `tsc`.

**Flow är ett rörligt mål.** `src/components/ui/` växte från 28 till 32 filer
under det dygn den här planen skrevs. Kör torrkörningen om igen precis innan
varje etapp, och ta etapperna när inget annat pågår i repot — en halvfärdig
migrering blandad med annat arbete är svår att backa.

## Etapp 1 · Icon

111 filer byter en importrad:

```diff
- import { Icon } from "@/components/ui/Icon";
+ import { Icon } from "@momenty/ui";
```

Tio filer importerar dessutom typen `IconNamn` från samma ställe; den
exporteras med samma namn ur paketet.

**Ett tecken har bytt namn.** `fraga-flow` heter `assistent` i paketet — namnet
var varumärkesbundet och ett delat paket kan inte bära det. Elva anropsställen
berörs:

```bash
grep -rl 'namn="fraga-flow"' src | xargs sed -i '' 's/namn="fraga-flow"/namn="assistent"/g'
```

Därefter kan `src/components/ui/Icon.tsx` raderas. Verifiera med `tsc` att
inget importerar den längre.

## Etapp 2 · Infrastruktur

Fyra ändringar, alla engångs.

**1. Beroendet**

```bash
npm install github:momenty-se/momenty-ui#v0.1.0
```

**2. `next.config.mjs`** — Flow har ingen `transpilePackages` idag och behöver
en, eftersom paketet distribueras som TypeScript-källkod:

```js
transpilePackages: ["@momenty/ui"],
```

**3. Brofilen** — `src/styles/mo-bridge.css`. Se
[TOKENS.md](TOKENS.md#brofilen) för hela innehållet.

**Specificitetsfällan.** Paketets `tokens.css` sätter `--mo-*` två gånger: en
gång på `:root` och en gång på `.dark`. Brofilen som bara skriver `:root` har
*samma* specificitet som `.dark`-blocket, så den vinner enbart på källordning.
Skriv därför brofilens selektor så att den vinner oavsett:

```css
:root,
:root.dark,
:root[data-theme="dark"] {
  --mo-accent: var(--flow-accent);
  /* … */
}
```

Värdena pekar på Flows egna variabler, som redan byter i mörkt läge — därför
behöver brofilen bara skrivas en gång trots tre selektorer.

**4. `layout.tsx`** — paketets CSS ersätter två av Flows filer och måste ligga
kvar på samma plats i ordningen, alltså efter `globals.css`:

```diff
  import "./globals.css";
- import "@/styles/flow/button.css";
- import "@/styles/flow/field.css";
+ import "@momenty/ui/css/base.css";
+ import "@/styles/mo-bridge.css";
  import "@/styles/flow/dialog.css";
```

Brofilen efter paketet, annars vinner golvvärdena.

## Etapp 3 · Button

75 filer byter importrad. Propnamnen är oförändrade — paketet bär Flows hela
avvecklade API som alias, så `variant="ghost"`, `"danger"`, `"accent"`,
`"brand"`, `"varning"` och `"destructive-fylld"` fungerar precis som förut.
Detsamma gäller `size`, som ignoreras i båda.

Alla nio varianter som faktiskt används i Flow är täckta:

| Variant i Flow        | Antal | Blir              |
| --------------------- | ----- | ----------------- |
| `secondary`           | 131   | oförändrad        |
| `ghost`               | 47    | `quiet`           |
| `quiet`               | 22    | oförändrad        |
| `primary`             | 14    | oförändrad        |
| `destructive-fylld`   | 11    | `destructive-solid` |
| `accent` · `brand`    | 8     | `primary`         |
| `danger` · `varning`  | 7     | `warn`            |

### Klassnamnen i markup är det egentliga arbetet

**92 className-strängar i 46 filer** skriver klassen direkt på ett `<button>`
utan att gå via komponenten. De måste bytas — CSS har ingen mekanism för att
låta ett gammalt klassnamn ärva ett nytt utan att duplicera reglerna.

```bash
node scripts/migrera-klasser.mjs --etapp=button ../momenty-flow/src
```

Utan `--skriv` är det en torrkörning som listar filer och antal. Lägg till
`--skriv` när listan ser rimlig ut.

**Gör det inte med sed.** Två fällor som båda ser ut att fungera:

1. `\b` finns inte i BSD sed, som är den macOS kör. `s/flow-btn--text\b/…/`
   matchar aldrig — tyst — och man tror att klassen inte fanns.
2. Att städa dubbla mellanslag efteråt med `s/ "/"/g` klistrar ihop
   JSX-attribut: `id="a" className="x"` blir `id="a"className="x"`. En regel
   som kollapsar mellanslagssekvenser plattar dessutom hela filens indentering.

Skriptet rör bara innehållet i `className="…"` och `className={"…"}`, i den
ordning som krävs för att `flow-btn` inte ska äta prefixet i
`flow-btn--varning`, och hoppar över `ThemeToggle.tsx` — den bär
`flow-icon-btn--kant`, en variant paketet inte har, och migreras först när
`ThemeToggle` själv flyttas.

**Tre klasser städas bort på köpet.** De gör redan ingenting:

| Klass              | Antal | Varför                                             |
| ------------------ | ----- | -------------------------------------------------- |
| `flow-btn--sm`     | 35    | Medvetet tom regel sedan storlekarna bantades till en |
| `flow-btn--text`   | 30    | Gammalt namn för `quiet`, identiska regler          |
| `flow-btn--texts`  | 1     | Stavfel, har aldrig matchat något                   |

`--sm` och `--texts` tas bort utan ersättning; `--text` mappas till `quiet` i
sed-raden ovan.

### Vad som blir kvar av button.css

Nästan ingenting. Filen bantas till de två kontextreglerna för mobilens runda
flikknapp — och båda är i själva verket döda: `.flow-btn--rund` och
`.flow-btn--fraga` har **noll** förekomster i Flows kod. Kontexterna
`.flow-tabbar` och `.flow-nav--bar-knapp-pa-mobil` finns, men knappen de väntar
på kom aldrig.

Radera filen, eller behåll de två reglerna om den runda knappen är på väg
tillbaka. Det är Flows beslut, inte paketets.

## Etapp 4 · Input, Textarea, Field

51 filer byter importrad. `Input` har bytt propnamn men bär det gamla:
`inmatning="belopp"` fungerar, `kind="amount"` är det nya.

**60 className-strängar i 30 filer**, samma skript med den andra etappen:

```bash
node scripts/migrera-klasser.mjs --etapp=field ../momenty-flow/src
```

### Vad som blir kvar av field.css

Fyra regler som aldrig hörde till fältet: `.flow-fargprov`,
`.flow-fargvaljare`, `.flow-rutnat--tatt` och `.flow-tabell`. De flyttas
lämpligen till `monster.css`, där de hör hemma.

## Verifiering

Efter varje etapp, i den här ordningen:

```bash
npx tsc --noEmit
```

Sedan: **inga gamla klassnamn kvar.** Det här är den kontroll som faktiskt
fångar en halv migrering, eftersom en kvarglömd `flow-btn` inte är ett typfel
utan en knapp som tappar sin form utan att något går sönder:

```bash
grep -rn "flow-btn\|flow-input\|flow-textarea\|flow-field\|flow-icon-btn" src --include="*.tsx"
```

Ska ge noll träffar när etapp 3 och 4 är klara.

Till sist `npm run build`, som fångar det `tsc` inte gör — och kör igenom
Tailwind, som är där en felaktig laddningsordning visar sig.

## Vad som inte påverkas

Flows övriga sex CSS-filer rörs inte: `dialog.css`, `val.css`, `valjare.css`,
`aterkoppling.css`, `typografi.css` och `monster.css`. Komponenterna de hör
till — `Dialog`, `Select`, `Combobox`, `DateField`, `Dropdown`, `Menu`,
`Popover`, `Badge`, `Banner`, `Text`, `Skeleton` med flera — ligger kvar i Flow
tills de flyttas i en senare omgång.

Domänkomponenterna stannar permanent: `VisaBokforingen`, `OcrConfidenceIcon`
och hela `brand/`-mappen med `Orb`, `FlowSplash`, `Wordmark` och `Stoppsida`.

## Rullbarhet

Varje etapp är en egen commit och går att backa för sig. Etapp 2 är den enda
som måste ligga före de andra; 3 och 4 är oberoende av varandra och kan tas i
valfri ordning eller med veckor emellan.

Behåll `src/components/ui/`-filerna tills etappen är verifierad — radera dem i
en separat commit efter att `tsc` och bygget passerat. Då är återgången en
`git revert` i stället för en återskapning.
