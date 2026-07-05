interface RulesPageProps {
  onBack: () => void;
}

const OFFICIAL_RULES_URL = "https://magic.wizards.com/es/formats/booster-draft";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "¿Qué es el Booster Draft?",
    body:
      "Es la forma más clásica de draftear Magic: cada jugador abre sobres de una misma edición " +
      "y arma su mazo a partir de las cartas que va eligiendo, ronda a ronda, junto al resto de la mesa.",
  },
  {
    title: "Jugadores y sobres",
    body:
      "Se juega con entre 2 y 8 personas. Cada quien empieza con 3 sobres (habitualmente 3 " +
      "boosters de la misma edición), que se van abriendo uno por uno a medida que avanza el draft.",
  },
  {
    title: "Cómo se draftea",
    body:
      "Todos abren su primer sobre al mismo tiempo, eligen una carta y pasan el resto al vecino. " +
      "Así se repite hasta vaciar el sobre. El segundo sobre se pasa para el lado contrario, y el " +
      "tercero vuelve a pasarse como el primero. Las cartas elegidas nunca se muestran hasta terminar.",
  },
  {
    title: "Armado del mazo",
    body:
      "Con las cartas draftadas (alrededor de 45 entre los tres sobres) se arma un mazo de al " +
      "menos 40 cartas, sumando las tierras básicas necesarias, que no cuentan como parte de lo drafteado.",
  },
  {
    title: "Duración típica",
    body:
      "Una partida suele rondar los 20 minutos, y un evento completo (draft + todas las rondas) " +
      "alrededor de las 2 horas, dependiendo de la cantidad de jugadores.",
  },
];

export function RulesPage({ onBack }: RulesPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-[100] border-b border-gold/12 bg-background-panel px-6 py-4">
        <div className="mx-auto flex max-w-[900px] items-center gap-3.5">
          <button
            onClick={onBack}
            className="cursor-pointer rounded-md border border-gold/20 bg-transparent px-3 py-2 font-sans text-[13px] font-semibold whitespace-nowrap text-gold hover:bg-gold/10"
          >
            ← Volver
          </button>
          <h1 className="m-0 font-heading text-[clamp(16px,3vw,22px)] font-bold text-parchment">
            Reglas del Draft
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] flex-1 px-6 py-12">
        <div className="mb-10 text-center">
          <div className="mb-3 font-sans text-xs tracking-[6px] text-gold/60 uppercase">
            ✦ Cómo se juega ✦
          </div>
          <h2 className="m-0 font-heading text-[clamp(28px,5vw,40px)] font-extrabold text-parchment">
            Booster Draft
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-gold/12 bg-arcane-violet/4 p-6"
            >
              <h3 className="m-0 mb-2 font-heading text-lg font-bold text-gold">
                {section.title}
              </h3>
              <p className="m-0 font-body text-[15px] leading-relaxed text-parchment/70">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <a
          href={OFFICIAL_RULES_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-8 flex items-center justify-between gap-3 rounded-xl border border-gold/25 bg-gold/8 p-5 no-underline transition-colors hover:bg-gold/12"
        >
          <div>
            <div className="font-sans text-[11px] font-bold tracking-[2px] text-gold uppercase">
              Reglas oficiales
            </div>
            <p className="m-0 mt-1 font-body text-sm text-parchment/70">
              Consultá el reglamento completo de Booster Draft en el sitio oficial de Wizards of
              the Coast.
            </p>
          </div>
          <span className="shrink-0 font-heading text-xl text-gold">↗</span>
        </a>

        <p className="mt-6 text-center font-sans text-xs text-parchment/25">
          Fan-made casual tournament tracker. Not affiliated with Wizards of the Coast.
        </p>
      </main>
    </div>
  );
}
