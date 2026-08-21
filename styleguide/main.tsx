/**
 * Styleguiden — @momenty/ui.
 *
 * Varje komponent i sina tillstånd, i ett ljust och ett mörkt läge. Den finns
 * av ett skäl: allt annat i paketet går att verifiera med `tsc` och grep, men
 * INGEN kan se om en CSS-regel blev fel. Den här sidan är det enda stället där
 * en trasig färg, en tappad radie eller en kant som försvann faktiskt syns.
 *
 * Den importerar `../src` direkt, alltså exakt de filer en app installerar.
 */
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  Badge,
  Banner,
  Button,
  Checkbox,
  ChoiceCard,
  Chip,
  Combobox,
  DateField,
  Dialog,
  Dropdown,
  ErrorBoundary,
  Field,
  FilterStrip,
  Icon,
  ICON_GROUPS,
  ICON_LABELS,
  Input,
  Lightbox,
  Menu,
  PillSwitch,
  Popover,
  ReportRow,
  Select,
  SelectRow,
  SettingCard,
  SettingRow,
  Skeleton,
  StatusMark,
  Steps,
  Text,
  Textarea,
  Toggle,
  type IconName,
} from "../src";

import "../src/css/base.css";
import "./styleguide.css";

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="sg-section">
      <h2 className="mo-t-section-title">{title}</h2>
      {note ? <p className="mo-t-meta sg-note">{note}</p> : null}
      <div className="sg-row">{children}</div>
    </section>
  );
}

function Knappar() {
  return (
    <>
      <Section title="Knappen" note="Fyra roller, ett mått. Höjden är 44 px och går inte att skicka in.">
        <Button variant="primary">Primär</Button>
        <Button variant="secondary">Sekundär</Button>
        <Button variant="quiet">Avbryt</Button>
        <Button variant="warn">Bokför ändå</Button>
        <Button variant="destructive">Radera</Button>
        <Button variant="destructive-solid">Radera ändå</Button>
      </Section>
      <Section title="Knappen — tillstånd">
        <Button variant="primary" loading>
          Sparar
        </Button>
        <Button variant="primary" disabled>
          Inaktiv
        </Button>
        <Button variant="secondary" disabled>
          Inaktiv
        </Button>
        <Button variant="destructive" disabled>
          Inaktiv
        </Button>
        <Button variant="primary" icon={<Icon name="send" size={16} />}>
          Med tecken
        </Button>
      </Section>
      <Section title="Knappen — avvecklade namn ur momenty-flow" note="Ska se ut som sina nya motsvarigheter.">
        <Button variant="ghost">ghost → quiet</Button>
        <Button variant="danger">danger → warn</Button>
        <Button variant="accent">accent → primary</Button>
        <Button variant="destructive-fylld">destructive-fylld</Button>
      </Section>
      <Section title="Ikonknappen">
        <button type="button" className="mo-icon-btn" aria-label="Sök">
          <Icon name="search" size={16} />
        </button>
        <button type="button" className="mo-icon-btn mo-icon-btn--glass" aria-label="Stäng">
          <Icon name="close" size={16} />
        </button>
        <button type="button" className="mo-icon-btn" aria-label="Inaktiv" disabled>
          <Icon name="settings" size={16} />
        </button>
      </Section>
    </>
  );
}

function Falt() {
  const [datum, setDatum] = useState("2026-08-21");
  const [val, setVal] = useState<string | null>("b");
  const [konto, setKonto] = useState<string | null>("1930");

  return (
    <>
      <Section title="Fältet">
        <Field label="E-post" htmlFor="sg-epost" hint="Vi hör av oss hit.">
          <Input id="sg-epost" type="email" placeholder="namn@exempel.se" fullWidth />
        </Field>
        <Field label="Belopp" htmlFor="sg-belopp">
          <Input id="sg-belopp" kind="amount" defaultValue="1 234,50" />
        </Field>
        <Field label="Med fel" htmlFor="sg-fel" error="Fyll i en giltig adress.">
          <Input id="sg-fel" error fullWidth />
        </Field>
        <Field label="Låst" htmlFor="sg-last">
          <Input id="sg-last" defaultValue="Går inte att ändra" readOnly fullWidth />
        </Field>
      </Section>
      <Section title="Fältet — piller och textyta" note="Pillret är ett fält som ÄR sitt eget kommando.">
        <Input kind="pill" placeholder="Sök i verifikationer" />
        <Textarea placeholder="Anteckning" fullWidth />
        <Textarea placeholder="Med fel" error fullWidth />
      </Section>
      <Section title="Väljarna">
        <Field label="Standardval" htmlFor="sg-select">
          <Select id="sg-select" value="b" onChange={() => {}}>
            <option value="a">Alfa</option>
            <option value="b">Beta</option>
            <option value="c">Gamma</option>
          </Select>
        </Field>
        <Field label="Dropdown">
          <Dropdown
            value={val}
            options={[
              { value: "a", label: "Utan hjälptext" },
              { value: "b", label: "Med hjälptext", hint: "Andra raden förklarar valet" },
              { value: "c", label: "Tredje" },
            ]}
            onSelect={setVal}
          />
        </Field>
        <Field label="Combobox" hint="Söker i en lång lista.">
          <Combobox
            value={konto}
            options={[
              { value: "1930", code: "1930", label: "Företagskonto" },
              { value: "2440", code: "2440", label: "Leverantörsskulder" },
              { value: "3001", code: "3001", label: "Försäljning" },
            ]}
            onSelect={setKonto}
          />
        </Field>
        <Field label="Datum">
          <DateField value={datum} onChange={setDatum} />
        </Field>
      </Section>
      <Section title="Meny och popover">
        <Menu
          label="Fler"
          items={[
            { label: "Redigera", icon: "edit", onSelect: () => {} },
            { label: "Kopiera", icon: "copy", onSelect: () => {} },
            { label: "Radera", icon: "delete", onSelect: () => {}, destructive: true },
          ]}
        />
        <Popover term="Ingående moms" example="25 % på 1 000 kr = 250 kr">
          Momsen du betalat på dina inköp och får dra av.
        </Popover>
      </Section>
    </>
  );
}

function Val() {
  const [kryss, setKryss] = useState(true);
  const [kort, setKort] = useState("a");
  const [rad, setRad] = useState("x");
  const [läge, setLäge] = useState("manad");

  return (
    <>
      <Section title="Kryssrutan">
        <Checkbox checked={kryss} onChange={setKryss}>
          Skicka kvitto per e-post
        </Checkbox>
        <Checkbox checked={false} onChange={() => {}} disabled>
          Inaktiv
        </Checkbox>
      </Section>
      <Section title="Valkortet">
        <ChoiceCard
          selected={kort === "a"}
          title="Enskild firma"
          description="Du och företaget är samma juridiska person."
          onClick={() => setKort("a")}
        />
        <ChoiceCard
          selected={kort === "b"}
          title="Aktiebolag"
          description="Företaget är en egen juridisk person."
          onClick={() => setKort("b")}
        />
      </Section>
      <Section title="Valraden">
        <SelectRow selected={rad === "x"} onClick={() => setRad("x")}>
          Första alternativet
        </SelectRow>
        <SelectRow selected={rad === "y"} onClick={() => setRad("y")}>
          Andra alternativet
        </SelectRow>
      </Section>
      <Section title="Chippet och remsan" note="Remsan rullar i sidled under 640 px.">
        <FilterStrip>
          <Chip selected>Alla</Chip>
          <Chip count={12}>Obetalda</Chip>
          <Chip count={3}>Förfallna</Chip>
          <Chip>Betalda</Chip>
          <Chip disabled>Inaktiv</Chip>
        </FilterStrip>
      </Section>
      <Section title="Segmentväxeln">
        <PillSwitch
          value={läge}
          options={[
            { value: "manad", label: "Månad" },
            { value: "kvartal", label: "Kvartal" },
            { value: "ar", label: "År" },
          ]}
          onChange={setLäge}
          ariaLabel="Period"
        />
      </Section>
      <Section title="Statusmärket och växeln">
        <StatusMark status="done">Bokförd</StatusMark>
        <StatusMark status="pending">Väntar</StatusMark>
        <StatusMark status="draft">Utkast</StatusMark>
        <StatusMark status="archived">Arkiverad</StatusMark>
        <span className="sg-toggle-demo" role="switch" aria-checked="true" tabIndex={0}>
          <Toggle on />
        </span>
        <span className="sg-toggle-demo" role="switch" aria-checked="false" tabIndex={0}>
          <Toggle on={false} />
        </span>
      </Section>
    </>
  );
}

function Aterkoppling() {
  return (
    <>
      <Section title="Märket" note="Aldrig rött — ett märke är en status.">
        <Badge variant="success">Klart</Badge>
        <Badge variant="warning">Väntar</Badge>
        <Badge variant="error">Fel är gult</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="muted">Dämpad</Badge>
        <Badge variant="ai" icon={<Icon name="assistant" size={14} />}>
          Assistent
        </Badge>
        <Badge variant="outline">Kontur</Badge>
        <Badge variant="muted" eyebrow>
          Ögonbryn
        </Badge>
      </Section>
      <Section title="Banderollen">
        <div className="sg-stack">
          <Banner>Glasbanderollen är standardläget.</Banner>
          <Banner tone="pending" count={4} sub="Fyra verifikationer saknar underlag.">
            Något väntar på dig
          </Banner>
          <Banner tone="done">Momsdeklarationen är inskickad.</Banner>
          <Banner onClose={() => {}} action={<Button variant="quiet">Visa</Button>}>
            Med handling och stängkryss
          </Banner>
        </div>
      </Section>
      <Section title="Skelettet" note="Formen, inte en snurra.">
        <div className="sg-stack sg-skeletons">
          <Skeleton style={{ height: 28, width: "40%" }} />
          <Skeleton style={{ height: 16, width: "90%" }} />
          <Skeleton style={{ height: 16, width: "75%" }} />
        </div>
      </Section>
      <Section title="Felgränsen">
        <ErrorBoundary>
          <span className="mo-t-meta">Inget fel — barnen renderas.</span>
        </ErrorBoundary>
      </Section>
    </>
  );
}

const TYPROLLER = [
  "display",
  "page-title",
  "section-title",
  "subtitle",
  "card-title",
  "body",
  "meta",
  "review",
  "eyebrow",
  "amount",
  "total",
  "figure",
  "number",
] as const;

function Typografi() {
  return (
    <Section title="Typografin" note="Tretton roller. Belopp är aldrig fetstil och aldrig mono.">
      <div className="sg-stack">
        {TYPROLLER.map((r) => (
          <div key={r} className="sg-type-row">
            <code className="sg-type-name">{r}</code>
            <Text variant={r}>
              {r === "amount" || r === "total" || r === "figure" || r === "number"
                ? "12 345,67"
                : "Momsdeklaration för andra kvartalet"}
            </Text>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Monster() {
  return (
    <>
      <Section title="Rapportraden">
        <div className="sg-stack sg-wide">
          <ReportRow label="Försäljning" amount={125000} />
          <ReportRow label="Varav moms" amount={25000} indented />
          <ReportRow label="Summa intäkter" amount={150000} total />
          <ReportRow label="Utan värde" amount={null} />
        </div>
      </Section>
      <Section title="Inställningskortet">
        <div className="sg-stack sg-wide">
          <SettingCard title="Företagsuppgifter" hint="Syns på fakturor och i deklarationen.">
            <SettingRow label="Visningsnamn" value="Anders Nordvik" action="ändra" onAction={() => {}} />
            <SettingRow label="Organisationsnummer" value="556677-8899" />
            <SettingRow label="Momsregistrering" hint="Krävs för att bokföra moms." action="koppla" onAction={() => {}} />
            <SettingRow label="Ingenting ifyllt" />
          </SettingCard>
          <SettingCard title="Radera företaget" destructive hint="Går inte att ångra.">
            <SettingRow label="Alla verifikationer" action="radera" onAction={() => {}} />
          </SettingCard>
        </div>
      </Section>
      <Section title="Stegen">
        <div className="sg-wide">
          <Steps steps={["Underlag", "Kontering", "Granska", "Bokför"]} current={2} onNavigate={() => {}} />
        </div>
      </Section>
    </>
  );
}

function Tecken() {
  return (
    <Section title={`Tecknen — ${ICON_GROUPS.reduce((n, g) => n + g.name.length, 0)} stycken`} note="Ett 24-rutnät, kontur, ärver färg.">
      <div className="sg-stack sg-wide">
        {ICON_GROUPS.map((grupp) => (
          <div key={grupp.heading}>
            <p className="mo-t-eyebrow">{grupp.heading}</p>
            <div className="sg-icons">
              {grupp.name.map((n: IconName) => (
                <div key={n} className="sg-icon" title={ICON_LABELS[n]}>
                  <Icon name={n} size={22} />
                  <code>{n}</code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Overlagg() {
  const [dialog, setDialog] = useState(false);
  const [ljus, setLjus] = useState(false);
  return (
    <Section title="Överläggen">
      <Button variant="secondary" onClick={() => setDialog(true)}>
        Öppna dialog
      </Button>
      <Button variant="secondary" onClick={() => setLjus(true)}>
        Öppna ljuslåda
      </Button>
      <Dialog
        open={dialog}
        title="Bokför ändå?"
        label="Kontroll"
        onClose={() => setDialog(false)}
        width="sm"
        footer={
          <>
            <Button variant="quiet" onClick={() => setDialog(false)}>
              Avbryt
            </Button>
            <Button variant="warn" onClick={() => setDialog(false)}>
              Bokför ändå
            </Button>
          </>
        }
      >
        <p className="mo-t-body">
          Underlaget saknar momssats. Du kan bokföra ändå och rätta senare.
        </p>
      </Dialog>
      <Lightbox
        open={ljus}
        onClose={() => setLjus(false)}
        alt="Exempelbild"
        url="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='560'%3E%3Crect width='420' height='560' fill='%23f3efe4'/%3E%3Ctext x='210' y='280' text-anchor='middle' font-family='sans-serif' font-size='22' fill='%237a7064'%3EKvitto%3C/text%3E%3C/svg%3E"
      />
    </Section>
  );
}

function Styleguide() {
  const [mörkt, setMörkt] = useState(false);

  // Klassen sätts på <html>, precis som Tailwinds darkMode: "class" gör i
  // apparna — styleguiden ska testa samma väg som verkligheten.
  document.documentElement.classList.toggle("dark", mörkt);

  return (
    <div className="sg-page">
      <header className="sg-header">
        <div>
          <p className="mo-t-eyebrow">@momenty/ui</p>
          <h1 className="mo-t-display">Styleguide</h1>
          <p className="mo-t-body sg-lead">
            Trettio komponenter, 164 tokens. Det enda stället där en trasig
            CSS-regel faktiskt syns.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setMörkt((v) => !v)} icon={<Icon name={mörkt ? "light" : "dark"} size={16} />}>
          {mörkt ? "Ljust läge" : "Mörkt läge"}
        </Button>
      </header>

      <Knappar />
      <Falt />
      <Val />
      <Aterkoppling />
      <Typografi />
      <Monster />
      <Overlagg />
      <Tecken />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Styleguide />
  </StrictMode>,
);
