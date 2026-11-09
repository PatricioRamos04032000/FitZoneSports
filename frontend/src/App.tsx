import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/organisms/Layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import Home from "./portal/Home/Home";
import Login from "./portal/Login/Login";
import Signup from "./portal/Login/Signup";
import Dashboard from "./portal/Login/Dashboard";
import Perfil from "./portal/Perfil/Perfil";
import Canchas from "./portal/Canchas/Canchas";
import Clases from "./portal/Clases/Clases";
import Notificaciones from "./portal/Notificaciones/Notificaciones";
import MiQr from "./portal/MiQr/MiQr";
import Acceso from "./admin/Acceso/Acceso";

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
            <Route path="/clases" element={<Clases />} />
            <Route path="/notificaciones" element={<Notificaciones />} />

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
