import { useState, useCallback, createContext, useContext } from "react";
import Modal from "./Modal";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback(
    (message, { title = "Confirmar", okText = "Confirmar", cancelText = "Cancelar", danger = false } = {}) => {
      return new Promise((resolve) => {
        setState({ message, title, okText, cancelText, danger, resolve });
      });
    },
    []
  );

  function handleOk() {
    state?.resolve(true);
    setState(null);
  }
  function handleCancel() {
    state?.resolve(false);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!state}
        onClose={handleCancel}
        title={state?.title ?? "Confirmar"}
        footer={
          <>
            <button className="btn" onClick={handleCancel}>{state?.cancelText ?? "Cancelar"}</button>
            <button className={state?.danger ? "btn-danger" : "btn-primary"} onClick={handleOk}>
              {state?.okText ?? "Confirmar"}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 py-2">{state?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
