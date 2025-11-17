import React from "react";
import { motion } from "framer-motion";

export const SectionTitle = ({ title, subtitle }) => {
  return (
    <motion.div
      className="mb-8 flex flex-col gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex flex-col gap-2">
        <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Sección</p>
        <motion.h2
          className="text-2xl font-semibold text-white md:text-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {title}
        </motion.h2>
        <motion.div
          className="h-px w-24 rounded-full bg-gradient-to-r from-white via-amber-200 to-transparent"
          initial={{ width: 0 }}
          animate={{ width: "6rem" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {subtitle && (
        <p className="max-w-2xl text-sm leading-relaxed text-slate-300/90">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
