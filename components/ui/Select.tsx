"use client";

import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  surface?: "store" | "admin";
  options: { value: string; label: string }[];
}

export default function Select({
  label,
  error,
  surface = "store",
  options,
  id,
  className = "",
  ...rest
}: SelectProps) {
  const selectId = id ?? rest.name;
  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`select ${surface === "admin" ? "select--admin" : ""} ${className}`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="admin-form__error">{error}</span>}
    </div>
  );
}
