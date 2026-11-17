import type { ReactNode, SelectHTMLAttributes } from "react";
import "./Select.css";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  id: string;
  children: ReactNode;
};

function Select({ label, id, className, children, ...rest }: SelectProps) {
  const classes = ["atom-select", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <label htmlFor={id}>{label}</label>
      <select id={id} {...rest}>
        {children}
      </select>
    </div>
  );
}

export default Select;
