import React from "react";
import { motion } from "framer-motion";

export const SimpleBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-[24px] border border-white/10 bg-white/5 text-sm text-slate-400">
        📉 No hay suficientes datos para mostrar la gráfica.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => Math.abs(d.value))) || 1;

  return (
    <div className="flex h-52 items-end gap-4">
      {data.map((d, index) => {
        const height = (Math.abs(d.value) / max) * 100;
        const positive = d.value >= 0;

        return (
          <div key={d.key} className="group flex flex-1 flex-col items-center gap-3">
            <div className="relative flex h-full w-full items-end justify-center">
              <div className="relative flex h-full w-9 items-end justify-center overflow-hidden rounded-3xl border border-white/5 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.05 }}
                  className={`w-full rounded-3xl bg-gradient-to-t ${
                    positive
                      ? "from-emerald-300/80 via-emerald-200/70 to-white"
                      : "from-rose-400/80 via-rose-300/70 to-white"
                  }`}
                />
              </div>

              <div className="pointer-events-none absolute -top-8 opacity-0 transition duration-200 group-hover:opacity-100">
                <div className="rounded-full border border-white/20 bg-[#080b15]/90 px-3 py-1 text-[10px] text-white shadow-lg">
                  {d.value.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </div>
              </div>
            </div>

            <span className="text-[11px] uppercase tracking-wide text-slate-400 group-hover:text-white">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
