"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

import { useClickOutside } from "@/hooks/use-click-outside";
import { useEscapeKey } from "@/hooks/use-escape-key";

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
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  useClickOutside({
    enabled: isOpen,
    onClickOutside: closeDropdown,
    ref: rootRef,
  });
  useEscapeKey({ enabled: isOpen, onEscape: closeDropdown });

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
