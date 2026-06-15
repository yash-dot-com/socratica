import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export type SocraticaLandingProps = {
  onGetStarted?: () => void;
};

const HERO_COPY =
  "an exploration platform that strips away boring definitions and teaches you how to break down any complex idea down to its absolute, simplest truth.";

function SketchFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white p-3 text-[#222222] sm:p-4">
      <section className="relative flex min-h-[calc(100vh-1.5rem)] items-center justify-center overflow-hidden rounded-[3.5rem] border-[4px] border-[#222222] bg-white px-6 py-20 sm:min-h-[calc(100vh-2rem)] sm:px-10 lg:px-16">
        <div className="pointer-events-none absolute inset-x-16 bottom-0 h-[5px] rounded-full bg-[#222222] opacity-90" />
        {children}
      </section>
    </main>
  );
}

function SocraticaWordmark() {
  return (
    <h1 className="font-mono text-[clamp(4.75rem,12vw,9rem)] font-black leading-none tracking-[-0.08em] text-[#222222] [text-shadow:0_1px_0_currentColor]">
      Socratica
    </h1>
  );
}

function HeroDescription() {
  return (
    <p className="mx-auto mt-12 max-w-[58rem] text-center font-mono text-[clamp(1.6rem,3vw,2.6rem)] font-bold leading-[1.18] tracking-[-0.06em] text-[#222222]">
      {HERO_COPY}
    </p>
  );
}

function GetStartedButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="mt-20 h-auto rounded-2xl border-[4px] border-[#222222] bg-white px-8 py-2 font-mono text-[clamp(1.8rem,4vw,3rem)] font-black leading-none tracking-[-0.08em] text-[#222222] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
    >
      get started
    </Button>
  );
}

function HeroContent({ onGetStarted }: SocraticaLandingProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
      <SocraticaWordmark />
      <HeroDescription />
      <GetStartedButton onClick={onGetStarted} />
    </div>
  );
}

export function SocraticaLanding({ onGetStarted }: SocraticaLandingProps) {
  return (
    <SketchFrame>
      <HeroContent onGetStarted={onGetStarted} />
    </SketchFrame>
  );
}

export default SocraticaLanding;
