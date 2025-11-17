import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export const LoginModal = ({ open, onClose }) => {
  const { user, login, logout, refreshSyncCode } = useAuth();
  const [form, setForm] = useState({ name: "", email: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
    setForm({ name: "", email: "" });
    onClose?.();
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="surface-card w-full max-w-md space-y-5 p-6 text-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Cuenta</p>
            <h2 className="text-xl font-semibold text-white">
              {user ? "Perfil conectado" : "Inicia sesión"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-white"
          >
            Cerrar
          </button>
        </div>

        {user ? (
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="text-xs text-slate-400">Nombre</p>
              <p className="text-base text-white">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-base text-white">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-100">
                Código de sincronización
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{user.syncCode}</p>
              <p className="text-xs text-emerald-100/70">
                Usa este código en otro dispositivo para importar tus datos.
              </p>
              <div className="mt-3 flex gap-2 text-xs">
                <button
                  onClick={refreshSyncCode}
                  className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-white"
                >
                  Renovar código
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.syncCode);
                  }}
                  className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-white"
                >
                  Copiar
                </button>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-white"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">Nombre completo</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                placeholder="Ej. Laura Sánchez"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                placeholder="tu@correo.com"
              />
            </div>
            <p className="text-xs text-slate-400">
              Guardaremos tus credenciales localmente para conectar futuros dispositivos.
            </p>
            <button
              type="submit"
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-white"
            >
              Entrar
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};
