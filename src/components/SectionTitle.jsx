import React from "react";
import { motion } from "framer-motion";

export const SectionTitle = ({ title, subtitle }) => {
  return (
    <motion.div
      className="mb-6 flex flex-col gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* TÍTULO */}
      <motion.h2
        className="text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r 
          from-sky-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {title}
      </motion.h2>

      {/* LÍNEA DECORATIVA */}
      <motion.div
        className="h-[2px] w-16 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500"
        initial={{ width: 0 }}
        animate={{ width: "4rem" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* SUBTÍTULO */}
      {subtitle && (
        <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
