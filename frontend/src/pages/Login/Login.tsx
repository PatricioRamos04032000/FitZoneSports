import { useState } from "react";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    console.log("Usuario:", usuario);
    console.log("Contraseña:", clave);
  };

  return (
    <div>
      <h1>FitZone Sports</h1>
      <h2>Iniciar sesión</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            type="text"
            value={usuario}
            onChange={(event) => setUsuario(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="clave">Contraseña</label>
          <input
            id="clave"
            type="password"
            value={clave}
            onChange={(event) => setClave(event.target.value)}
          />
        </div>

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}

export default Login;