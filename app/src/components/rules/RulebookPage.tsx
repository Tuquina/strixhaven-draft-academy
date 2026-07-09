import { FAN_CONTENT_NOTICE } from "../../lib/legal";
import { GRADIENT_TEXT_GOLD, GRADIENT_TEXT_HERO, PANEL_GOLD } from "../../lib/designSystem";

interface RulebookPageProps {
  onBack: () => void;
}

const RULEBOOK_PDF_URL = "/rules/magic-guia-inicio-rapido.pdf";

export function RulebookPage({ onBack }: RulebookPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-[100] border-b border-gold/10 bg-background-panel/70 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-[900px] items-center gap-3.5">
          <button
            onClick={onBack}
            className="cursor-pointer rounded-md border border-gold/20 bg-transparent px-3 py-2.5 font-sans text-[13px] font-semibold whitespace-nowrap text-gold hover:bg-gold/10"
          >
            ← Volver
          </button>
          <h1 className={`${GRADIENT_TEXT_GOLD} m-0 font-heading-decorative text-[clamp(16px,3vw,22px)] font-bold`}>
            Manual de Magic
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 text-center">
          <div className="mb-3 font-sans text-[10px] tracking-[3px] text-gold/60 uppercase sm:text-xs sm:tracking-[6px]">
            ✦ Guía oficial ✦
          </div>
          <h2 className={`${GRADIENT_TEXT_HERO} m-0 font-heading-decorative text-[clamp(24px,5vw,36px)] font-black animate-[heroTitleGlow_4s_ease-in-out_infinite]`}>
            Guía de Inicio Rápido
          </h2>
        </div>

        {/* Desktop: embedded PDF, scrolls fine with a mouse/trackpad. */}
        <div className="hidden overflow-hidden rounded-xl border border-gold/15 bg-black/25 backdrop-blur-sm sm:block">
          <iframe
            src={RULEBOOK_PDF_URL}
            title="Magic: The Gathering — Guía de Inicio Rápido"
            className="h-[75vh] w-full"
          />
        </div>
        <p className="mt-4 hidden text-center font-sans text-xs text-parchment/35 sm:block">
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

        {/* Mobile: iOS/Android don't support touch-scrolling a PDF embedded in an iframe,
            so open it as a normal page instead — the phone's native PDF viewer handles
            pinch-zoom and scroll properly there. */}
        <a
          href={RULEBOOK_PDF_URL}
          target="_blank"
          rel="noreferrer"
          className={`${PANEL_GOLD} flex flex-col items-center gap-3 p-8 text-center no-underline transition-colors hover:bg-gold/16 sm:hidden`}
        >
          <span className="text-5xl">📖</span>
          <span className="font-heading text-base font-bold text-gold">Abrir la guía completa</span>
          <span className="font-body text-sm text-parchment/60">
            En el celular se lee mejor a pantalla completa, con zoom y scroll nativos.
          </span>
        </a>

        <p className="mt-6 text-center font-sans text-xs text-parchment/25">{FAN_CONTENT_NOTICE}</p>
      </main>
    </div>
  );
}
