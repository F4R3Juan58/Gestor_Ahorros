import React from "react";
import { motion } from "framer-motion";

const statusConfig = {
  positive: {
    badge: "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
    text: "text-emerald-100",
    label: "Saludable",
    gradient: "from-emerald-200/10 via-transparent to-transparent",
  },
  negative: {
    badge: "border-rose-300/40 bg-rose-400/10 text-rose-100",
    text: "text-rose-100",
    label: "Revisar",
    gradient: "from-rose-200/15 via-transparent to-transparent",
  },
  neutral: {
    badge: "border-slate-300/30 bg-white/5 text-slate-100",
    text: "text-white",
    label: "Seguimiento",
    gradient: "from-white/10 via-transparent to-transparent",
  },
};

export const StatCard = ({ label, value, highlight = "neutral", helper }) => {
  const config = statusConfig[highlight] || statusConfig.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="surface-soft relative flex h-full flex-col overflow-hidden p-5"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.gradient}`}
      />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {label}
          </p>
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-medium ${config.badge}`}
          >
            {config.label}
          </span>
        </div>

        <p className={`text-3xl font-semibold ${config.text}`}>
          {typeof value === "number"
            ? value.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 2,
              })
            : value}
        </p>

        {helper && (
          <p className="text-sm leading-relaxed text-slate-300/80">{helper}</p>
        )}
      </div>
    </motion.div>
  );
};
