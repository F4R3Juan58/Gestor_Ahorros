import React from "react";
import { motion } from "framer-motion";

export const SimpleBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl bg-slate-900/40 backdrop-blur-xl text-sm text-slate-400 ring-1 ring-white/10">
        📉 No hay suficientes datos para mostrar la gráfica.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => Math.abs(d.value))) || 1;

  return (
    <div className="flex h-48 items-end gap-3 px-1">
      {data.map((d, index) => {
        const height = (Math.abs(d.value) / max) * 100;
        const positive = d.value >= 0;

        return (
          <div
            key={d.key}
            className="flex flex-1 flex-col items-center gap-2 group"
          >
            {/* Contenedor barra */}
            <div className="relative flex h-full w-full items-end justify-center">
              <div className="relative flex h-full w-8 items-end justify-center overflow-hidden rounded-2xl bg-slate-900/80 ring-1 ring-slate-700/60 shadow-md shadow-black/50 backdrop-blur-xl">
                {/* Barra */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.05 }}
                  className={`w-full rounded-2xl bg-gradient-to-t ${
                    positive
                      ? "from-emerald-500 via-emerald-400 to-sky-300"
                      : "from-rose-500 via-rose-400 to-amber-300"
                  } shadow-xl shadow-black/30`}
                />
              </div>

              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-6 opacity-0 group-hover:opacity-100 transition opacity duration-200">
                <div className="rounded-xl bg-slate-900/90 px-2 py-1 text-[10px] shadow-md shadow-black/40 ring-1 ring-white/10">
                  {d.value.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </div>
              </div>
            </div>

            {/* Etiqueta */}
            <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
