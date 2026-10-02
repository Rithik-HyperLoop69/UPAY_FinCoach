"use client";

import React from "react";
import "./shiny-button.css";

export interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function ShinyButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  ...props
}: ShinyButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`shiny-cta ${className}`.trim()}
      onClick={onClick}
      {...props}
    >
      <span>{children}</span>
    </button>
  );
}

export default ShinyButton;
