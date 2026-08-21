# @momenty/ui

Momentys gemensamma komponentbibliotek. **Paketet äger formen, appen äger
färgen.**

Komponenterna kommer från `momenty-se/momenty-flow`, som är facit för
designen. Ändras en färg eller ett mått där ska det ändras här — inte tvärtom.
Det repot är privat, så länken hit är avsiktligt utskriven som namn i stället
för som klickbar adress.

## Koppla in

```bash
npm install github:momenty-se/momenty-ui#v0.3.0
```

Paketet distribueras som TypeScript-källkod, inte förbyggt. Next.js behöver
därför transpilera det:

```js
// next.config.mjs
export default {
  transpilePackages: ["@momenty/ui"],
};
```

Importera CSS:en i rotlayouten, **efter** `globals.css`:

```tsx
// app/layout.tsx
import "./globals.css";
import "@momenty/ui/css/base.css";
```

### Laddningsordningen är arkitektur, inte en detalj

CSS:en måste hamna efter `@tailwind utilities`. Då vinner `.mo-btn`s padding
över ett inskickat `px-4 py-2` på källordning, och storlek går inte att smyga
in via `className`. Layout fungerar fortfarande — `flex-1`, `w-full`, `mt-6` —
eftersom komponenterna aldrig deklarerar margin, width eller flex.

Laddas filen före utilities gäller det omvända, och systemets enda knappstorlek
blir ett förslag.

## Använd

```tsx
import { Button, Field, Icon, Input } from "@momenty/ui";

<Field label="E-post" htmlFor="epost" hint="Vi hör av oss hit.">
  <Input id="epost" type="email" fullWidth />
</Field>

<Button variant="primary" icon={<Icon name="send" size={16} />}>
  Skicka
</Button>
```

## Vad som finns

| Komponent   | CSS              |
| ----------- | ---------------- |
| `Button`    | `css/button.css` |
| `Icon`      | — (inline SVG, 60 tecken) |
| `Input`     | `css/field.css`  |
| `Textarea`  | `css/field.css`  |
| `Field`     | `css/field.css`  |
| `Select`    | `css/picker.css` |
| `Combobox`  | `css/picker.css` |
| `Dropdown`  | `css/picker.css` |
| `Menu`      | `css/picker.css` |
| `Popover`   | `css/picker.css` |
| `DateField` | `css/picker.css` |

De sex sista delar panel, tangentbord och positionering via `picker-shared.ts`.
Panelen portaleras till `document.body` — ett `position: absolute` inuti sidan
räcker inte, eftersom varje glasyta bär `backdrop-filter` och den egenskapen
skapar en stacking context som panelen inte kan ta sig ur.

`css/base.css` importerar tokens plus alla komponenters CSS i rätt ordning.
Vill du styra ordningen själv importerar du filerna var för sig — `tokens.css`
måste då komma först.

## Anpassa

Skriv inte om `tokens.css`. Lägg en brofil som pekar kontraktets `--mo-*` på
appens egna variabler:

```css
:root {
  --mo-accent: var(--flow-accent);
  --mo-text: var(--flow-ink);
  /* … ~30 rader, en gång */
}
```

Hela listan och namnreglerna finns i [docs/TOKENS.md](docs/TOKENS.md).

## Språk

API:t är engelskt rakt igenom — props, typer, ikonnamn, CSS-klasser, tokens.
Kommentarerna är svenska, eftersom de är dokumentation på arbetsspråket. UI-text
som når slutanvändaren är också svensk, eftersom produkterna är det.

## Bidra

- En app som behöver något bara den har bygger det i sin egen kodbas. Först
  när två appar byggt samma sak är det en kandidat för paketet.
- Undantag skrivs genom att sätta om en token, inte genom en ny variant — då
  syns undantaget i tokenlistan i stället för att gömma sig i CSS:en.
- `npx tsc --noEmit` innan commit.
