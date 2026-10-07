function Canchas() {
  return (
    <div>
      <h1>Canchas</h1>

      <h2>Seleccionar sede</h2>

      <select>
        <option value="">Seleccionar sede</option>
        <option value="sede1">Sede 1</option>
        <option value="sede2">Sede 2</option>
      </select>

      <h2>Seleccionar horario</h2>

      <select>
        <option value="">Seleccionar horario</option>
        <option value="10">10:00</option>
        <option value="11">11:00</option>
        <option value="12">12:00</option>
        <option value="13">13:00</option>
        <option value="14">14:00</option>
        <option value="15">15:00</option>
        <option value="16">16:00</option>
        <option value="17">17:00</option>
        <option value="18">18:00</option>
        <option value="19">19:00</option>
        <option value="20">20:00</option>
        <option value="21">21:00</option>
      </select>

      <h2>Canchas</h2>

      <div>
        <div>
          <h3>Cancha 1</h3>
          <p>Tipo: Tipo de cancha</p>
          <p>Precio por hora: $X</p>
          <p>Estado: Disponible</p>

          <button>Reservar</button>
        </div>

        <div>
          <h3>Cancha 2</h3>
          <p>Tipo: Tipo de cancha</p>
          <p>Precio por hora: $X</p>
          <p>Estado: Ocupada</p>
        </div>

        <div>
          <h3>Cancha 3</h3>
          <p>Tipo: Tipo de cancha</p>
          <p>Precio por hora: $X</p>
          <p>Estado: Mantenimiento</p>
        </div>
      </div>
    </div>
  );
}

export default Canchas;