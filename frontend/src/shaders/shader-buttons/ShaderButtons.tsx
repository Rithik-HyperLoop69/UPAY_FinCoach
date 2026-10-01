import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";

import type { NeuformIsolatedEffectProps } from "../neuform-isolated/NeuformIsolatedEffects";
import type { ShaderButtonStudyVariant } from "./ShaderButtonStudies";
import type { SelectedButtonStudyVariant } from "./SelectedButtonStudies";

export type ShaderButtonVariant =
  | "star-portal"
  | "ignition-button"
  | "induction-button"
  | "plasma-button"
  | "tactile-button"
  | "thinking-button"
  | "raking-light-pill"
  | "liquid-glass"
  | "intelligence"
  | "holo-foil"
  | "particles"
  | "voice-orb"
  | "water"
  | "dither-hold"
  | "lava-lamp"
  | "gold"
  | "ink"
  | SelectedButtonStudyVariant;

/** @deprecated Variant names that shipped before a rename. Use {@link ShaderButtonVariant}. */
export type LegacyShaderButtonVariant = "uploading-button";

export type ShaderButtonsProps = NeuformIsolatedEffectProps & {
  variant?: ShaderButtonVariant | LegacyShaderButtonVariant;
  label?: string;
  onClick?: () => void;
};

const LEGACY_SHADER_BUTTON_VARIANTS = {
  "uploading-button": "thinking-button",
} satisfies Record<LegacyShaderButtonVariant, ShaderButtonVariant>;

const SelectedButtonStudies = lazy(() =>
  import("./SelectedButtonStudies").then((module) => ({ default: module.SelectedButtonStudies })),
);

const SHADER_BUTTON_VARIANTS = {
  "star-portal": lazy(() =>
    import("../neuform-isolated/NeuformIsolatedEffects").then((module) => ({ default: module.StarPortal })),
  ),
  "ignition-button": lazy(() =>
    import("../neuform-isolated/NeuformIsolatedEffects").then((module) => ({ default: module.IgnitionButton })),
  ),
  "induction-button": lazy(() =>
    import("../neuform-isolated/NeuformIsolatedEffects").then((module) => ({ default: module.InductionButton })),
  ),
  "plasma-button": lazy(() =>
    import("../neuform-isolated/NeuformIsolatedEffects").then((module) => ({ default: module.PlasmaButton })),
  ),
  "tactile-button": lazy(() =>
    import("../neuform-isolated/NeuformIsolatedEffects").then((module) => ({ default: module.TactileButton })),
  ),
  "thinking-button": lazy(() =>
    import("../neuform-isolated/NeuformIsolatedEffects").then((module) => ({ default: module.ThinkingButton })),
  ),
  "raking-light-pill": lazy(() =>
    import("./RakingLightPillButton").then((module) => ({ default: module.RakingLightPillButton })),
  ),
  ...Object.fromEntries(
    (["liquid-glass", "intelligence", "holo-foil", "particles", "voice-orb", "water", "dither-hold", "lava-lamp", "gold", "ink"] as const)
      .map((id) => [id, lazy(() => import("./ShaderButtonStudies").then((module) => ({
        default: (props: NeuformIsolatedEffectProps) => <module.ShaderButtonStudy {...props} variant={id} />,
      })))]),
  ) as Record<ShaderButtonStudyVariant, LazyExoticComponent<ComponentType<NeuformIsolatedEffectProps>>>,
} satisfies Record<Exclude<ShaderButtonVariant, SelectedButtonStudyVariant>, LazyExoticComponent<ComponentType<NeuformIsolatedEffectProps>>>;

export function ShaderButtons({ variant = "star-portal", ...props }: ShaderButtonsProps) {
  const resolved = variant in LEGACY_SHADER_BUTTON_VARIANTS
    ? LEGACY_SHADER_BUTTON_VARIANTS[variant as LegacyShaderButtonVariant]
    : variant as ShaderButtonVariant;
  if (!(resolved in SHADER_BUTTON_VARIANTS)) {
    return (
      <Suspense fallback={null}>
        <SelectedButtonStudies variant={resolved as SelectedButtonStudyVariant} {...props} />
      </Suspense>
    );
  }
  const Variant = SHADER_BUTTON_VARIANTS[resolved as keyof typeof SHADER_BUTTON_VARIANTS];

  return (
    <Suspense fallback={null}>
      <Variant {...props} />
    </Suspense>
  );
}
