import React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}


export function Button({
  type = "default",
  size = "middle",
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  const isDisabled = disabled || loading;

  const sizeCls =
    size === "small"
      ? "h-8 px-3 text-sm"
      : size === "large"
      ? "h-10 px-4 text-base"
      : "h-9 px-4 text-sm";

  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 select-none";
  const ring = "focus:ring-blue-500";

  const variants = {
    default:
      "border border-gray-300 bg-white text-gray-900 hover:border-blue-500 hover:text-blue-600 active:border-blue-600 active:text-blue-700",
    primary:
      "border border-blue-600 bg-blue-600 text-white hover:bg-blue-500 hover:border-blue-500 active:bg-blue-700 active:border-blue-700",
    dashed:
      "border border-dashed border-gray-300 bg-white text-gray-900 hover:border-blue-500 hover:text-blue-600",
    text: "border border-transparent bg-transparent text-gray-900 hover:bg-gray-100 active:bg-gray-200",
    link: "border border-transparent bg-transparent text-blue-600 hover:text-blue-500 active:text-blue-700 px-0",
  };

  const disabledCls =
    "opacity-60 cursor-not-allowed hover:!border-gray-300 hover:!text-gray-900 hover:!bg-white hover:!bg-transparent";

  return (
    <button
      type="button"
      className={cn(
        base,
        ring,
        sizeCls,
        variants[type] || variants.default,
        isDisabled && disabledCls,
        className
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <span
          className={cn(
            "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
            type === "primary" ? "text-white" : "text-gray-700"
          )}
          aria-hidden="true"
        />
      )}
      <span className={cn(type === "link" ? "underline-offset-4 hover:underline" : "")}>
        {children}
      </span>
    </button>
  );
}