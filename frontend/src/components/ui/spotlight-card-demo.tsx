import { GlowCard } from "@/components/ui/spotlight-card";

export function Default() {
  return (
    <div className="w-screen h-screen flex flex-row items-center justify-center gap-10 custom-cursor bg-[#050610] p-8">
      <GlowCard glowColor="blue">
        <div className="flex flex-col justify-between h-full">
          <div>
            <span className="text-xs font-mono uppercase text-sky-400">Card 01</span>
            <h3 className="text-xl font-bold text-white mt-1">Autonomous Flow</h3>
            <p className="text-xs text-slate-400 mt-2">
              Continuous spotlight tracing synchronizes across card boundaries.
            </p>
          </div>
          <div className="text-[11px] font-mono text-sky-300 bg-sky-950/40 p-2 rounded-lg border border-sky-800/40">
            glowColor: blue
          </div>
        </div>
      </GlowCard>

      <GlowCard glowColor="purple">
        <div className="flex flex-col justify-between h-full">
          <div>
            <span className="text-xs font-mono uppercase text-purple-400">Card 02</span>
            <h3 className="text-xl font-bold text-white mt-1">Dynamic Glow</h3>
            <p className="text-xs text-slate-400 mt-2">
              Shared pointer coordinate calculation across all cards in the layout.
            </p>
          </div>
          <div className="text-[11px] font-mono text-purple-300 bg-purple-950/40 p-2 rounded-lg border border-purple-800/40">
            glowColor: purple
          </div>
        </div>
      </GlowCard>

      <GlowCard glowColor="green">
        <div className="flex flex-col justify-between h-full">
          <div>
            <span className="text-xs font-mono uppercase text-emerald-400">Card 03</span>
            <h3 className="text-xl font-bold text-white mt-1">Specular Border</h3>
            <p className="text-xs text-slate-400 mt-2">
              Dual-layer radial masks with dynamic hue rotation and soft ambient falloff.
            </p>
          </div>
          <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
            glowColor: green
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

export default Default;
