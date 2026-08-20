# Tokenkontraktet

Paketet levererar **formen**. Appen levererar **färgen**. Gränsen mellan dem
är den här listan med CSS-variabler.

En komponentfil i paketet ska aldrig behöva skilja sig mellan två appar.
Behöver den det är det ett tecken på att en token saknas — inte på att
komponenten behöver forkas.

## momenty-flow är facit

Golvvärdena i `tokens.css` är Flows, avskrivna ur `src/app/globals.css` och
inte omtolkade. En app som kopplar in paketet utan att säga någonting får
alltså Momentys utseende, inte ett neutralt utseende den sedan måste bygga
bort. Vid konflikt mellan två appars sätt att göra något vinner Flows.

Följden är att **ändringar går ett håll**: en färg som ändras i Flow ska
ändras här. Att ändra här först och låta Flow följa efter gör paketet till en
andra sanning, vilket är precis vad det finns till för att undvika.
Motiveringarna till varför en färg är vad den är står kvar i Flow, som äger
besluten.

## Namnreglerna

**Prefixet är `--mo-` på allt.** momenty-flow har 178 egna variabler och
control-room 72. Tre namn förekommer redan i båda med olika betydelse:
`--accent` är `#00c9a0` i Flow och `9 9 11` i control-room — motsatt färg,
dessutom i oförenliga format (hex mot RGB-triplett för Tailwinds alfakanal).
Ett eget prefix gör att paketet aldrig kan råka ärva ett värde som betyder
något annat.

**Namnen är roller, inte platser i en skala.** `--mo-bg-raised` säger vad ytan
gör — den lyfter något ur bakgrunden. `--surface-2` säger bara var i en
numrerad räcka den ligger, vilket tvingar varje ny app att gissa vilket nummer
som betyder "kort". Gissningarna blir olika.

**Formen är `--mo-<kategori>-<roll>`**, och kategorin utelämnas när rollen är
kategorins grundfall: `--mo-bg`, inte `--mo-bg-base`. `--mo-text`, inte
`--mo-text-primary`.

**Engelska.** Tokens och CSS-klasser läses av varje app och av
Tailwind-konfigurationer, och är en teknisk gränsyta. Komponenternas
propnamn följer i stället repots äldre regel — engelska för generiskt,
svenska för domän — med ett dokumenterat undantag, se längst ned.

## Listan

### Ytor

Fem nivåer, i hur mycket de sticker ut från grunden. `inset` är den enda som
går nedåt.

| Token             | Roll                                    |
| ----------------- | --------------------------------------- |
| `--mo-bg`         | Sidans grund                            |
| `--mo-bg-subtle`  | Svagt avvikande yta: zebrarader, hover  |
| `--mo-bg-raised`  | Kort och paneler                        |
| `--mo-bg-overlay` | Dialoger, popovers, menyer              |
| `--mo-bg-inset`   | Nedsänkt: fält man skriver i            |

### Text

| Token                  | Roll                                          |
| ---------------------- | --------------------------------------------- |
| `--mo-text`            | Brödtext                                      |
| `--mo-text-muted`      | Sekundär                                      |
| `--mo-text-faint`      | Tertiär, hjälptext, inaktiv                   |
| `--mo-text-on-accent`  | Text ovanpå `--mo-accent`                     |
| `--mo-text-on-bad`     | Text ovanpå fylld `--mo-bad`                  |

`faint` är det svagaste som fortfarande klarar 4,5:1 mot `--mo-bg`. Behöver du
något svagare är svaret att ta bort texten, inte att blekna den.

### Linjer

| Token               | Roll                          |
| ------------------- | ----------------------------- |
| `--mo-line`         | Standardlinje                 |
| `--mo-line-strong`  | Betonad: hovring, aktiv kant  |

### Accent

| Token                 | Roll                                    |
| --------------------- | --------------------------------------- |
| `--mo-accent`         | Varumärkets handlingsfärg               |
| `--mo-accent-hover`   | Samma färg, en nivå upp                 |
| `--mo-accent-subtle`  | Tonad bakgrund: märken, vald rad        |

### Status

Semantik, skild från accenten: en app som byter accentfärg ska inte råka byta
betydelsen av "klart". Varje status har tre roller — fylld yta, tonad
bakgrund, och text som är läsbar på den tonade bakgrunden.

| Token                                                  | Roll               |
| ------------------------------------------------------ | ------------------ |
| `--mo-good` · `--mo-good-subtle` · `--mo-good-text`     | Klart, godkänt     |
| `--mo-warn` · `--mo-warn-subtle` · `--mo-warn-text`     | Fel, väntar, obs   |
| `--mo-bad` · `--mo-bad-subtle` · `--mo-bad-text`        | Oåterkalleligt     |

**Ett fel är gult, inte rött.** Rött bär bara det som inte går att ångra. Ett
fält som inte är ifyllt rätt är en fråga, inte en oåterkallelig handling — och
en knapp som säger "Bokför ändå" får inte se ut som "Radera". Regeln kommer
från momenty-flow och är inbakad i `field.css`, som använder `--mo-warn` för
valideringsfel.

### Glas

Både Flow och control-room bygger på glasmorfism. Golvet är Flows glas.

| Token               | Roll                                            |
| ------------------- | ----------------------------------------------- |
| `--mo-glass-bg`     | Glasfyllning                                    |
| `--mo-glass-line`   | Glaskant                                        |
| `--mo-glass-hover`  | Hovring på glas                                 |
| `--mo-glass-blur`   | `blur(24px) saturate(1.2)` — sätt `none` för matt |

En app som inte vill ha glas sätter `--mo-glass-blur: none` och pekar `bg` och
`line` på sina matta ytor. Inget behöver stängas av på komponentnivå.

### Form

| Token                | Värde i golvet | Roll                          |
| -------------------- | -------------- | ----------------------------- |
| `--mo-control-h`     | `44px`         | Golv för allt man trycker på  |
| `--mo-radius-sm`     | `4px`          | Märken, små ytor              |
| `--mo-radius-md`     | `10px`         | Fält, kort                    |
| `--mo-radius-lg`     | `14px`         | Paneler, dialoger             |
| `--mo-radius-pill`   | `999px`        | Knappar, piller               |

`--mo-control-h` är satt efter WCAG 2.2 (Target Size, AA) och Flows §04.
**Höj det gärna. Sänk det aldrig.**

Textytan har dessutom ett eget tak: radien klamras till 22 px oavsett vad
`--mo-radius-md` sätts till, eftersom ett flerradigt fält inte kan vara ett
piller.

### Typografi, rörelse, fokus, skuggor

| Token                                    | Roll                                        |
| ---------------------------------------- | ------------------------------------------- |
| `--mo-font-sans` · `-serif` · `-mono`    | Ärvs från appen; finns för de få undantagen |
| `--mo-motion-fast` · `-base`             | 120 ms · 200 ms                             |
| `--mo-focus-ring`                        | Egen token, inte accenten — se nedan        |
| `--mo-shadow-sm` · `-md`                 | Två nivåer                                  |

Fokusringen är egen och inte accentens, eftersom den måste synas mot alla ytor
och en ljus accent inte alltid duger som ring. Flows original hade ingen
fokusring alls på knappen — den var tangentbordsosynlig så snart någon
nollställde `outline`. Paketet lägger tillbaka den.

## Brofilen

En app skriver **inte** om `tokens.css`. Den lägger en egen fil som mappar sina
befintliga variabler till kontraktet. Ungefär trettio rader, en gång.

För Flow ger brofilen samma värden som golvet redan har — den finns ändå, och
det är hela poängen: så länge Flow pekar in sina egna variabler följer paketet
automatiskt med när en färg ändras där, i stället för att långsamt driva isär.

```css
/* momenty-flow · src/styles/mo-bridge.css */
:root {
  --mo-bg: var(--flow-paper);
  --mo-bg-subtle: var(--flow-cream);
  --mo-bg-raised: var(--flow-ark);
  --mo-bg-inset: var(--flow-glass-input);

  --mo-text: var(--flow-ink);
  --mo-text-muted: var(--flow-tx2);
  --mo-text-faint: var(--flow-mute);
  --mo-text-on-accent: var(--flow-on-accent);

  --mo-line: var(--flow-rule);
  --mo-line-strong: var(--flow-rule-2);

  --mo-accent: var(--flow-accent);
  --mo-accent-hover: var(--flow-accent-hover);

  --mo-warn: var(--flow-amber);
  --mo-warn-subtle: var(--flow-amber-tint);
  --mo-warn-text: var(--flow-amber-text);

  --mo-bad: var(--flow-error);
  --mo-text-on-bad: var(--flow-error-on);

  --mo-glass-bg: var(--flow-glass-input);
  --mo-glass-line: var(--flow-glass-kant);
  --mo-glass-hover: var(--flow-glass-hover);
  --mo-glass-blur: var(--flow-glass-2-blur);

  --mo-control-h: var(--flow-btn-h);
  --mo-radius-md: var(--flow-r-field);
  --mo-radius-pill: var(--flow-radius-pill);

  --mo-motion-fast: var(--flow-t-hover);
  --mo-focus-ring: var(--flow-jade-dark);
}
```

Ligger appens mörka läge på `.dark` behöver brofilen inte upprepas där — den
pekar på appens egna variabler, som redan byter värde.

Control-room mappar på samma sätt, med den skillnaden att dess färger är
RGB-tripletter för Tailwinds alfakanal och behöver lindas:

```css
/* control-room · apps/web/app/mo-bridge.css */
:root {
  --mo-bg: rgb(var(--surface-0));
  --mo-bg-subtle: rgb(var(--surface-1));
  --mo-bg-raised: rgb(var(--surface-2));
  --mo-text: rgb(var(--tx-primary));
  --mo-accent: rgb(var(--accent));
  /* … */
}
```

## Klassnamnen

`mo-<block>[--<modifierare>]`, engelska genomgående.

| Block            | Modifierare                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| `.mo-btn`        | `--primary` `--secondary` `--quiet` `--destructive` `--destructive-solid` `--warn` `--block` |
| `.mo-icon-btn`   | `--glass`                                                                |
| `.mo-input`      | `--amount` `--pill` `--invalid`                                          |
| `.mo-textarea`   | `--invalid`                                                              |
| `.mo-field`      | `--plain` `--invalid` `--locked`                                         |
| `.mo-label` · `.mo-hint` · `.mo-field-error` · `.mo-field-group` | — |

En app som behöver en knapp som bryter mot systemet skriver den i sin **egen**
CSS. Mönstret är att sätta om en token i stället för att skriva en ny regel,
så att undantaget syns i tokenlistan i stället för att gömma sig i en variant:

```css
.flow-btn--fraga { --mo-btn-weight: 600; }
```

Först när två appar har skrivit samma undantag är det en kandidat för paketet.

## Undantaget: `Icon` har svenska propnamn

`Icon` kom hit från momenty-flow med 109 anropsställen som redan skriver
`namn`, `storlek`, `vrid` och `etikett`. Att översätta dem samtidigt som
adressen byttes hade varit två risker i en, så de står kvar.

Allt annat följer regeln: `Button`, `Input`, `Field` och `Textarea` har
engelska propnamn, och tokens och klassnamn är engelska utan undantag.
