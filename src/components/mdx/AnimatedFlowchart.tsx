'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  Check,
  Coins,
  CreditCard,
  FileText,
  Landmark,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  FileText,
  ArrowRightLeft,
  Coins,
  CreditCard,
  ShieldCheck,
  Landmark,
  Wallet,
};

export interface FlowStep {
  icon: string;
  label: string;
  desc: string;
}

export interface Flow {
  title: string;
  direction?: string;
  steps: FlowStep[];
}

const DURATION_MS = 2400;

export function AnimatedFlowchart({ flows }: { flows: Flow[] }) {
  return (
    <div className="not-prose">
      <style>{`
        @keyframes af-node-pulse {
          0% { transform: scale(1); opacity: 0.45; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes af-fade-up {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .af-node { transition: background-color .6s ease, border-color .6s ease, color .6s ease, box-shadow .6s ease, transform .6s ease; }
        .af-pulse { animation: af-node-pulse 2.2s ease-out infinite; }
        .af-desc { animation: af-fade-up .5s ease both; }
        .af-progress { transition: width .8s cubic-bezier(.4, 0, .2, 1); }
      `}</style>
      <div className="space-y-6">
        {flows.map((flow) => (
          <FlowDiagram key={flow.title} flow={flow} />
        ))}
      </div>
    </div>
  );
}

function FlowDiagram({ flow }: { flow: Flow }) {
  const count = flow.steps.length;
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
    const t = setInterval(() => setActive((a) => (a + 1) % count), DURATION_MS);
    return () => clearInterval(t);
  }, [count]);

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-gold">{flow.title}</span>
        {flow.direction && (
          <span className="rounded-full border border-line px-2.5 py-0.5 text-[10px] tracking-wide text-ink-tertiary">
            {flow.direction}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-0 right-0 top-5 hidden h-px bg-line sm:block" />
        <div
          className="af-progress absolute left-0 top-5 hidden h-px bg-gold sm:block"
          style={{ width: `${(active / (count - 1)) * 100}%` }}
        />

        <div className="relative grid grid-cols-5 gap-y-5 sm:gap-x-0">
          {flow.steps.map((step, si) => {
            const Icon = ICONS[step.icon] ?? FileText;
            const isActive = si === active;
            const isDone = si < active;
            return (
              <div key={si} className="flex flex-col items-center gap-2 text-center">
                <div className="relative">
                  {isActive && (
                    <span className="af-pulse absolute inset-0 rounded-full border border-gold" aria-hidden />
                  )}
                  <div
                    className={`af-node relative flex h-10 w-10 items-center justify-center rounded-full border ${
                      isActive
                        ? 'border-gold bg-gold/15 text-gold shadow-[0_0_16px_rgba(212,183,143,0.25)]'
                        : isDone
                          ? 'border-line bg-surface-2 text-ink-secondary'
                          : 'border-line bg-surface-1 text-ink-tertiary'
                    }`}
                  >
                    {isDone && !isActive ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <div className="px-1">
                  <div
                    className={`text-[11px] font-medium leading-tight transition-colors duration-500 ${
                      isActive ? 'text-gold' : 'text-ink-secondary'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div
                    key={`${flow.title}-${si}-${isActive}`}
                    className={`af-desc mt-0.5 hidden max-w-[130px] text-[10px] leading-snug text-ink-tertiary md:block ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
