import { useMemo, useEffect } from "react";

import type { NeuformIsolatedEffectProps } from "../neuform-isolated/NeuformIsolatedEffects";
import source from "./sources/button-index.html?raw";

export const SELECTED_BUTTON_STUDIES = {
  "glassy-split": { index: 2, title: "Glassy Split", light: "#0e1014", dark: "#0e1014" },
  "generate-site": { index: 3, title: "Generate Site", light: "#100421", dark: "#100421" },
  "chrome-upload": { index: 4, title: "Chrome Upload", light: "#d1d1d1", dark: "#16191f" },
  "book-a-demo": { index: 7, title: "Book a Demo", light: "#fafafa", dark: "#171b1b" },
  "iridescent-glass": { index: 8, title: "Iridescent Glass", light: "#f2f2f1", dark: "#171b28" },
  "create-and-get-started": { index: 9, title: "Create & Get Started", light: "#ffffff", dark: "#191d25" },
  "soft-surface": { index: 10, title: "Soft Surface", light: "#dce1e5", dark: "#222a34" },
  balloon: { index: 11, title: "Balloon", light: "#11131d", dark: "#11131d" },
  "light-switch": { index: 14, title: "Light Switch", light: "#e6ebff", dark: "#171c33" },
  "start-growing": { index: 16, title: "Start Growing", light: "#ecf3e9", dark: "#102019" },
  "car-controls": { index: 18, title: "Car Controls", light: "#e8eaed", dark: "#191d24" },
} as const;

export type SelectedButtonStudyVariant = keyof typeof SELECTED_BUTTON_STUDIES;

function focusedSource(index: number, mode: "light" | "dark", background: string, label?: string) {
  const style = `<style data-threeui-study-focus>
    html, body, body > main, .button-list, .button-row[data-index="${index}"],
    .button-row[data-index="${index}"] .stage-frame,
    .button-row[data-index="${index}"] .stage { width: 100% !important; height: 100% !important; min-height: 0 !important; }
    html, body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: transparent !important; }
    body > main { max-width: none !important; padding: 0 !important; }
    .list-header, .list-footer, .button-row .number, .button-row .study-meta, .button-row .source { display: none !important; }
    .button-list { display: block !important; margin: 0 !important; padding: 0 !important; list-style: none !important; }
    .button-row { display: none !important; }
    .button-row[data-index="${index}"] { display: block !important; border: 0 !important; padding: 0 !important; }
    .button-row[data-index="${index}"] .stage-frame { display: block !important; overflow: hidden !important; }
    .button-row[data-index="${index}"] .stage { display: block !important; overflow: hidden !important; }
    .button-row[data-index="${index}"] .artboard {
      top: 50% !important;
      transform: translate(-50%, -50%) scale(var(--threeui-study-scale, 1)) !important;
      transition: none !important;
      cursor: pointer !important;
    }
    .button-row[data-index="${index}"] .stage[data-hover=true] .artboard,
    .button-row[data-index="${index}"] .stage[data-pressed=true] .artboard {
      transform: translate(-50%, -50%) scale(var(--threeui-study-scale, 1)) !important;
    }
    .glass-download {
      cursor: pointer !important;
    }
  </style>`;

  const script = `<script data-threeui-study-focus>
    (() => {
      const index = ${index};
      const mode = ${JSON.stringify(mode)};
      document.querySelector('[data-theme-choice="' + mode + '"]')?.click();
      const stage = document.querySelector('#study-' + index);
      if (!stage) return;
      const fit = () => {
        const scale = Math.min(innerWidth / 465, innerHeight / 128, 0.72);
        stage.style.setProperty('--threeui-study-scale', String(scale));
        stage.style.setProperty('--scale', String(scale));
      };
      fit();
      addEventListener('resize', fit);
      document.querySelectorAll('.button-row').forEach(row => {
        if (Number(row.dataset.index) === index) return;
        row.setAttribute('aria-hidden', 'true');
        row.inert = true;
      });
      document.querySelector('.list-header')?.setAttribute('aria-hidden', 'true');
      document.querySelector('.list-footer')?.setAttribute('aria-hidden', 'true');

      // Forward click event to parent window
      const dispatchClick = () => {
        window.parent.postMessage({ type: 'threeui-shader-button-click', index: index }, '*');
      };
      const btn = document.querySelector('.glass-download') || stage;
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          dispatchClick();
        });
      }
    })();
  </script>`;

  let processedSource = source;
  if (label && index === 8) {
    processedSource = processedSource.replaceAll('Download for Mac', label);
  }

  return processedSource.replace(/<\/head>/i, `${style}</head>`).replace(/<\/body>/i, `${script}</body>`);
}

export function SelectedButtonStudies({
  variant,
  mode = "light",
  hue = 0,
  saturation = 1,
  brightness = 1,
  className,
  style,
  label,
  onClick,
}: NeuformIsolatedEffectProps & {
  variant: SelectedButtonStudyVariant;
  label?: string;
  onClick?: () => void;
}) {
  const definition = SELECTED_BUTTON_STUDIES[variant];
  const selectedMode = mode === "dark" ? "dark" : "light";
  const background = "transparent";
  const document = useMemo(
    () => focusedSource(definition.index, selectedMode, background, label),
    [definition.index, selectedMode, background, label],
  );

  useEffect(() => {
    if (!onClick) return;
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'threeui-shader-button-click') {
        onClick();
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [onClick]);

  return (
    <div
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <iframe
        className={className}
        data-variant={variant}
        title={`${definition.title} button study`}
        srcDoc={document}
        sandbox="allow-scripts"
        loading="eager"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          background: "transparent",
          filter: `hue-rotate(${hue}deg) saturate(${saturation}) brightness(${brightness})`,
          ...style,
        }}
      />
    </div>
  );
}
