import type { ReactNode } from "react";
import "./Alerta.css";

type VarianteAlerta = "error";

type AlertaProps = {
  children: ReactNode;
  variante?: VarianteAlerta;
};

function Alerta({ children, variante = "error" }: AlertaProps) {
  return (
    <div className={`molecule-alerta molecule-alerta-${variante}`} role="alert">
      {children}
    </div>
  );
}

export default Alerta;
