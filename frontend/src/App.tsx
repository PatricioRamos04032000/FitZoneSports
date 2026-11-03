
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./pages/ProtectedRoute";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Login/Signup";
import Dashboard from "./pages/Login/Dashboard";
import Perfil from "./pages/Perfil/Perfil";
import Canchas from "./pages/Canchas/Canchas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/canchas" element={<Canchas />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
