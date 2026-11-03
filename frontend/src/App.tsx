import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./pages/ProtectedRoute";
import RoleRoute from "./pages/RoleRoute";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Login/Signup";
import Dashboard from "./pages/Login/Dashboard";
import Perfil from "./pages/Perfil/Perfil";
import Canchas from "./pages/Canchas/Canchas";
import MiQr from "./pages/MiQr/MiQr";
import Acceso from "./pages/Acceso/Acceso";

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

            <Route element={<RoleRoute allowedRoles={["socio"]} />}>
              <Route path="/mi-qr" element={<MiQr />} />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={["admin_sede", "gerente"]} />
              }
            >
              <Route path="/acceso" element={<Acceso />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
