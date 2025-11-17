import React from "react";
import { motion } from "framer-motion";

export const StatCard = ({ label, value, highlight = "neutral", helper }) => {
  // Iconos según el tipo
  const icons = {
    positive: "📈",
    negative: "📉",
    neutral: "📊",
  };

  const icon = icons[highlight] || icons.neutral;

  // Texto según estado
  const textColor =
    highlight === "positive"
      ? "text-emerald-300"
      : highlight === "negative"
      ? "text-rose-300"
      : "text-sky-300";

  // Gradiente según estado
  const gradient =
    highlight === "positive"
      ? "from-emerald-500/40 via-emerald-400/20 to-sky-500/20"
      : highlight === "negative"
      ? "from-rose-500/40 via-rose-400/20 to-amber-400/20"
      : "from-sky-500/40 via-indigo-500/20 to-fuchsia-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-3xl bg-slate-950/70 p-5 backdrop-blur-xl ring-1 ring-white/10 shadow-xl shadow-black/40"
    >
      {/* Fondo con gradiente */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-40`}
      />

      {/* Contenido */}
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-300">
            {label}
          </p>

          {/* ICONO */}
          <span className="text-lg opacity-90">{icon}</span>
        </div>

        {/* VALOR */}
        <p className={`text-2xl font-semibold ${textColor}`}>
          {typeof value === "number"
            ? value.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 2,
              })
            : value}
        </p>

        {/* TEXTO AUXILIAR */}
        {helper && (
          <p className="text-[11px] leading-relaxed text-slate-300/80">
            {helper}
          </p>
        )}
      </div>
    </motion.div>
  );
};
