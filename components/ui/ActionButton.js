"use client";
import { useToast } from "@/components/providers/ToastProvider";
import Icon from "./Icon";

/** Button that shows a toast. Swap onClick for real handlers as features are built. */
export default function ActionButton({ children, message, icon, primary, className = "", style, ...rest }) {
  const toast = useToast();
  return (
    <button
      type="button"
      className={`btn ${primary ? "p" : ""} ${className}`}
      style={style}
      onClick={() => toast(message || `${children} opened`)}
      {...rest}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
