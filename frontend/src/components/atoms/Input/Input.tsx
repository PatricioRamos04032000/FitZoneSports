import type { InputHTMLAttributes } from "react";
import "./Input.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
};

function Input({ label, id, className, ...rest }: InputProps) {
  const classes = ["atom-input", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...rest} />
    </div>
  );
}

export default Input;
