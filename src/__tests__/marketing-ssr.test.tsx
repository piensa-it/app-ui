// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";

import { ImageCarouselBackdrop } from "../components/marketing/image-carousel-backdrop";
import { PublicFooter } from "../components/marketing/public-footer";
import { PublicHeader } from "../components/marketing/public-header";
import { FeatureGrid } from "../components/marketing/feature-grid";
import { Hero } from "../components/marketing/hero";
import { Checklist } from "../components/marketing/checklist";
import { CtaBanner } from "../components/marketing/cta-banner";
import { PageHero } from "../components/marketing/page-hero";
import { ProcessSteps } from "../components/marketing/process-steps";
import { SplitSection } from "../components/marketing/split-section";
import { StatRow } from "../components/marketing/stat-row";
import { LanguageSwitcher } from "../components/marketing/language-switcher";
import { ThemeScript, ThemeToggle } from "../components/ui/theme-toggle";
import { Highlight, Section, SectionHeading } from "../components/marketing/section";

/**
 * Toda pieza de marketing se renderiza en el servidor (Astro, prerenderizado)
 * sin `window` ni `document` y sin avisos (#186, #187). Cada sección nueva se
 * agrega a esta lista.
 */
const secciones: [string, ReactElement][] = [
  [
    "PublicHeader con menú",
    <PublicHeader logoSrc="/logo.svg" brandName="Deliver" desktopNav={<a href="#a">A</a>} mobileNav={<a href="#a">A</a>} actions={<a href="/b">B</a>} />,
  ],
  [
    "PublicHeader en dos filas",
    <PublicHeader logoSrc="/logo.svg" brandName="CoreLink" desktopNav={<a href="#a">A</a>} actions={<a href="/b">B</a>} />,
  ],
  [
    "PublicFooter completo",
    <PublicFooter
      logoSrc="/logo.svg"
      brandName="Piensa IT"
      description="Software."
      columns={[{ title: "Producto", links: [{ to: "/precios", label: "Precios" }] }]}
      contact={[{ label: "info@piensait.com", href: "mailto:info@piensait.com" }]}
      version="app@1.0.0"
      year={2026}
    />,
  ],
  [
    "Section con SectionHeading",
    <Section id="a" tone="inverted" background="grid-glow">
      <SectionHeading eyebrow="A" title="B" description="C" rule />
    </Section>,
  ],
  [
    "FeatureGrid en sus cuatro variantes",
    <>
      {(["card", "list", "joined", "compact"] as const).map((variant) => (
        <FeatureGrid key={variant} variant={variant} numbered items={[{ title: "A", href: "/a", badge: { label: "B" }, bullets: ["C"], tags: ["D"] }]} />
      ))}
    </>,
  ],
  [
    "Hero con aside y centrado",
    <>
      <Hero eyebrow="A" title={<>B <Highlight>C</Highlight></>} actions={<a href="/d">D</a>} aside={<pre>E</pre>} footer={<p>F</p>} />
      <Hero title="G" />
    </>,
  ],
  [
    "StatRow, ProcessSteps y Checklist",
    <>
      <StatRow label="A" accent items={[{ value: "47", label: "B" }]} />
      <ProcessSteps orientation="vertical" steps={[{ title: "A" }, { title: "B" }]} />
      <Checklist columns={2} items={["A", { title: "B", description: "C" }]} />
    </>,
  ],
  [
    "SplitSection, PageHero y CtaBanner",
    <>
      <SplitSection title="A" media={<div>B</div>} reverse />
      <PageHero eyebrow="A" title="B" breadcrumbs={<nav>C</nav>} />
      <CtaBanner title="A" background="grid" actions={<a href="/b">B</a>} />
    </>,
  ],
  [
    "Header con firma, ThemeToggle, LanguageSwitcher y ThemeScript",
    <>
      <ThemeScript />
      <PublicHeader
        brandName="Deliver"
        signature
        actions={
          <>
            <ThemeToggle />
            <LanguageSwitcher value="en" languages={[{ code: "en", label: "English", href: "/" }, { code: "es", label: "Español", href: "/es/" }]} />
            <LanguageSwitcher variant="menu" value="en" languages={[{ code: "en", label: "English", href: "/" }]} />
          </>
        }
      />
    </>,
  ],
  [
    "ImageCarouselBackdrop",
    <ImageCarouselBackdrop images={["/a.jpg", "/b.jpg"]} />,
  ],
];

describe("Marketing — render de servidor", () => {
  afterEach(() => vi.restoreAllMocks());

  it.each(secciones)("%s renderiza sin DOM y sin avisos", (_, elemento) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const html = renderToString(elemento);

    expect(html.length).toBeGreaterThan(0);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });
});
