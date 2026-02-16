import React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function Checkbox({
  checked,
  defaultChecked = false,
  onChange,
  indeterminate = false,
  disabled = false,
  label,
  className,
  ...props
}) {
  const [internal, setInternal] = React.useState(defaultChecked);
  const isControlled = typeof checked === "boolean";
  const isChecked = isControlled ? checked : internal;

  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = !!indeterminate && !isChecked;
  }, [indeterminate, isChecked]);

  const handleChange = (e) => {
    const next = e.target.checked;
    if (!isControlled) setInternal(next);
    onChange?.(next, e);
  };

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 select-none",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className
      )}
    >
      <span className="relative inline-flex">
        <input
          ref={inputRef}
          type="checkbox"
          className={cn(
            "peer h-4 w-4 appearance-none rounded border border-gray-300 bg-white transition",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "checked:border-blue-600 checked:bg-blue-600",
            "disabled:cursor-not-allowed"
          )}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          {...props}
        />
        {/* Check / Indeterminate icon */}
        <span
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center text-white",
            "opacity-0 peer-checked:opacity-100"
          )}
          aria-hidden="true"
        >
          {indeterminate && !isChecked ? (
            <span className="block h-0.5 w-2.5 rounded bg-white" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[3]">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </span>

        {/* Indeterminate state when not checked */}
        <span
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center",
            "opacity-0",
            indeterminate && !isChecked ? "opacity-100" : ""
          )}
          aria-hidden="true"
        >
          <span className="block h-0.5 w-2.5 rounded bg-blue-600" />
        </span>
      </span>

      {label != null && <span className="text-sm text-gray-900">{label}</span>}
    </label>
  );
}