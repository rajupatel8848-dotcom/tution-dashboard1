"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";

const ConfirmContext = createContext(async () => true);
/** const confirm = useConfirm(); if (await confirm({ title, text })) { ... } */
export const useConfirm = () => useContext(ConfirmContext);

export default function ConfirmProvider({ children }) {
  const dialog = useRef(null);
  const resolver = useRef(null);
  const [opts, setOpts] = useState({ title: "", text: "" });

  const confirm = useCallback((o) => new Promise((resolve) => {
    resolver.current = resolve;
    setOpts(o);
    dialog.current?.showModal();
  }), []);

  const finish = (value) => {
    dialog.current?.close();
    resolver.current?.(value);
    resolver.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog ref={dialog} onCancel={() => { resolver.current?.(false); resolver.current = null; }}>
        <h3 style={{ margin: "0 0 6px" }}>{opts.title}</h3>
        <p className="muted">{opts.text}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button type="button" className="btn" onClick={() => finish(false)}>Cancel</button>
          <button type="button" className="btn p" onClick={() => finish(true)}>Confirm</button>
        </div>
      </dialog>
    </ConfirmContext.Provider>
  );
}
