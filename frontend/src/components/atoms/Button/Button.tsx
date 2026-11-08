import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

function Button({ className, type = "button", ...rest }: ButtonProps) {
  const classes = ["atom-button", className].filter(Boolean).join(" ");

  return <button type={type} className={classes} {...rest} />;
}

export default Button;
