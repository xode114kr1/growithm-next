"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type DropdownProps = {
  ariaLabel: string;
  buttonClassName?: string;
  children: ReactNode;
  className?: string;
  menuClassName?: string;
  trigger: ReactNode;
};

export default function Dropdown({
  ariaLabel,
  buttonClassName,
  children,
  className,
  menuClassName,
  trigger,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={className} ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className={buttonClassName}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {trigger}
      </button>
      {isOpen ? (
        <div className={menuClassName} role="menu">
          {children}
        </div>
      ) : null}
    </div>
  );
}
