import "./Spinner.css";

type SpinnerProps = {
  label?: string;
};

function Spinner({ label = "Cargando" }: SpinnerProps) {
  return <span className="atom-spinner" role="status" aria-label={label} />;
}

export default Spinner;
