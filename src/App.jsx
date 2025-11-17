import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Incomes } from "./pages/Incomes";
import { Subscriptions } from "./pages/Subscriptions";
import { Expenses } from "./pages/Expenses";
import { Analytics } from "./pages/Analytics";
import { Goals } from "./pages/Goals";

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ingresos" element={<Incomes />} />
        <Route path="/subscripciones" element={<Subscriptions />} />
        <Route path="/gastos" element={<Expenses />} />
        <Route path="/analitica" element={<Analytics />} />
        <Route path="/metas" element={<Goals />} />
      </Route>
    </Routes>
  );
};

export default App;
