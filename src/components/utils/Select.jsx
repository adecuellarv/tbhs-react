import React, { useEffect, useState, useMemo, useRef } from "react";

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

export function Select({
    value,
    onChange,
    placeholder = "Selecciona…",
    disabled = false,
    size = "middle",
    allowClear = false,
    showSearch = false,
    options = [],
    className,
}) {
    const rootRef = useRef(null);
    const inputRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const selected = options.find((o) => String(o.value) === String(value ?? ""));
    const displayLabel = selected?.label ?? "";

    const sizeCls =
        size === "small"
            ? "h-8 text-sm"
            : size === "large"
                ? "h-10 text-base"
                : "h-9 text-sm";

    const filtered = useMemo(() => {
        if (!showSearch) return options;
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) => String(o.label ?? "").toLowerCase().includes(q));
    }, [options, showSearch, query]);

    const openDropdown = () => {
        if (disabled) return;
        setOpen(true);
        if (showSearch) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const closeDropdown = () => {
        setOpen(false);
        setQuery("");
        setActiveIndex(0);
    };

    useEffect(() => {
        /*
        const onDocDown = (e) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target)) closeDropdown();
        };
        document.addEventListener("mousedown", onDocDown);
        return () => document.removeEventListener("mousedown", onDocDown);*/
    }, []);

    useEffect(() => {
        if (!open) return;
        // set active to selected if present in filtered
        const idx = filtered.findIndex((o) => String(o.value) === String(value ?? ""));
        setActiveIndex(idx >= 0 ? idx : 0);
    }, [open]);

    const pick = (opt) => {
        if (!opt || opt.disabled) return;
        onChange?.(opt.value, opt);
        closeDropdown();
    };


    const onKeyDownControl = (e) => {
        if (disabled) return;

        if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
            e.preventDefault();
            openDropdown();
            return;
        }

        if (!open) return;

        if (e.key === "Escape") {
            e.preventDefault();
            closeDropdown();
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();
            pick(filtered[activeIndex]);
        }
    };

    console.log('#value', value)

    return (
        <div ref={rootRef} className={cn("relative w-full", className)}>
            {/* Control */}
            {!open &&
                <div
                    role="combobox"
                    aria-expanded={open}
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => (open ? closeDropdown() : openDropdown())}
                    onKeyDown={onKeyDownControl}
                    className={cn(
                        "w-full rounded-md px-3 pr-10 transition",
                        "",
                        sizeCls,
                        disabled
                            ? "cursor-not-allowed bg-gray-50 text-gray-500 border-gray-200"
                            : "cursor-pointer border-gray-300 hover:border-blue-500"
                    )}
                    style={{
                        border: '1px solid #eee'
                    }}
                >
                    <div className="flex h-full items-center gap-2">
                        <div className={cn("flex-1 truncate", !displayLabel ? "text-gray-400" : "text-gray-900")}>
                            {displayLabel || placeholder}
                        </div>



                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </span>
                    </div>
                </div>
            }
            {/* Dropdown */}
            {open && (
                <div
                    className={cn(
                        "absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white",
                        "max-h-64 overflow-auto"
                    )}
                    style={{
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        border: "1px solid #eee"
                    }}
                >
                    {showSearch && (
                        <div className="p-2 border-b border-gray-100 ">
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setActiveIndex(0);
                                }}
                                onKeyDown={(e) => {
                                    // let arrows / enter handled by parent too
                                    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
                                        e.preventDefault();
                                        onKeyDownControl(e);
                                    }
                                }}
                                placeholder="Buscar…"
                                className={cn(
                                    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm",
                                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500"
                                )}
                            />
                        </div>
                    )}

                    <ul role="listbox" className="py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-gray-500">Sin resultados</li>
                        ) : (
                            filtered.map((opt, idx) => {
                                const isSelected = String(opt.value) === String(value ?? "");
                                const isActive = idx === activeIndex;

                                return (
                                    <li
                                        key={String(opt.value)}
                                        role="option"
                                        aria-selected={isSelected}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        onMouseDown={(e) => e.preventDefault()} // evita blur/cierre antes del click
                                        onClick={() => pick(opt)}
                                        onChange={() => alert('hola-2')}
                                        className={cn(
                                            "px-3 py-2 text-sm transition",
                                            opt.disabled
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "cursor-pointer text-gray-900",
                                            isActive && !opt.disabled ? "bg-blue-50" : "",
                                            isSelected ? "font-medium" : ""
                                        )}
                                    >
                                        {opt.label}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
