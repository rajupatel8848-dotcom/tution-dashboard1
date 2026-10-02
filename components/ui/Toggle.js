"use client";

export default function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" className="tg" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} />
  );
}
