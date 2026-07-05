import { FAN_CONTENT_NOTICE } from "../../lib/legal";
import { GRADIENT_TEXT_GOLD, GRADIENT_TEXT_HERO } from "../../lib/gradients";

interface RulebookPageProps {
  onBack: () => void;
}

const RULEBOOK_PDF_URL = "/rules/magic-guia-inicio-rapido.pdf";

export function RulebookPage({ onBack }: RulebookPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-[100] border-b border-gold/10 bg-background-panel/70 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-[900px] items-center gap-3.5">
          <button
            onClick={onBack}
            className="cursor-pointer rounded-md border border-gold/20 bg-transparent px-3 py-2 font-sans text-[13px] font-semibold whitespace-nowrap text-gold hover:bg-gold/10"
          >
            ← Volver
          </button>
          <h1 className={`${GRADIENT_TEXT_GOLD} m-0 font-heading-decorative text-[clamp(16px,3vw,22px)] font-bold`}>
            Manual de Magic
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] flex-1 px-6 py-8">
        <div className="mb-6 text-center">
          <div className="mb-3 font-sans text-xs tracking-[6px] text-gold/60 uppercase">
            ✦ Guía oficial ✦
          </div>
          <h2 className={`${GRADIENT_TEXT_HERO} m-0 font-heading-decorative text-[clamp(24px,5vw,36px)] font-black animate-[heroTitleGlow_4s_ease-in-out_infinite]`}>
            Guía de Inicio Rápido
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-gold/15 bg-black/25 backdrop-blur-sm">
          <iframe
            src={RULEBOOK_PDF_URL}
            title="Magic: The Gathering — Guía de Inicio Rápido"
            className="h-[75vh] w-full"
          />
        </div>

        <p className="mt-4 text-center font-sans text-xs text-parchment/35">
          ¿No se ve bien el manual acá arriba?{" "}
          <a
            href={RULEBOOK_PDF_URL}
            target="_blank"
            rel="noreferrer"
            className="text-gold underline hover:text-gold/80"
          >
            Abrilo en una pestaña aparte
          </a>
          .
        </p>

        <p className="mt-6 text-center font-sans text-xs text-parchment/25">{FAN_CONTENT_NOTICE}</p>
      </main>
    </div>
  );
}
