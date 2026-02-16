import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  title,
  onClose,
  footer = null, // null => footer automático con botones; false => sin footer; ReactNode => custom footer
  okText = "OK",
  cancelText = "Cancelar",
  onOk,
  okButtonProps = {},
  cancelButtonProps = {},
  closable = true,
  maskClosable = true,
  widthClass = "w-[92vw] sm:w-[520px]",
  bodyClassName = "",
  children,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);

    // Focus al panel (accesibilidad básica)
    setTimeout(() => panelRef.current?.focus?.(), 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const showDefaultFooter = footer === null;
  const showFooter = footer !== false;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Mask */}
      <div
        className="absolute inset-0 bg-black/45"
        onClick={() => {
          if (maskClosable) onClose?.();
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative ${widthClass} max-h-[85vh] rounded-lg bg-white shadow-xl outline-none animate-[tbhsModalIn_.12s_ease-out]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <div className="min-w-0">
              {title ? (
                <h3 className="truncate text-base font-semibold text-gray-900">
                  {title}
                </h3>
              ) : (
                <div />
              )}
            </div>

            {closable && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`px-4 py-4 overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3">
            {showDefaultFooter ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                  {...cancelButtonProps}
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={onOk}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                  {...okButtonProps}
                >
                  {okText}
                </button>
              </>
            ) : (
              footer
            )}
          </div>
        )}

        {/* Animación (sin depender de tailwind keyframes custom) */}
        <style>{`
          @keyframes tbhsModalIn {
            from { transform: translateY(6px) scale(.98); opacity: .0; }
            to   { transform: translateY(0) scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
