"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type Props = {
  trigger: (args: { open: boolean; toggle: () => void; ref: React.RefObject<HTMLButtonElement | null> }) => ReactNode;
  children: (args: { close: () => void }) => ReactNode;
  placement?: "bottom-start" | "bottom-end" | "bottom-center";
  className?: string;
  panelClassName?: string;
  offset?: number;
};

export default function Popover({
  trigger,
  children,
  placement = "bottom-start",
  className,
  panelClassName,
  offset = 8,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const id = useId();

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const panel = panelRef.current;
    const panelW = panel?.offsetWidth ?? 0;
    const left =
      placement === "bottom-end"
        ? r.right + window.scrollX - panelW
        : placement === "bottom-center"
          ? r.left + window.scrollX + r.width / 2 - panelW / 2
          : r.left + window.scrollX;
    setPos({ top: r.bottom + window.scrollY + offset, left, width: r.width });
  }, [open, placement, offset]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        panelRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      )
        return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={cn("relative inline-block", className)}>
      {trigger({ open, toggle, ref: triggerRef })}
      {open && (
        <div
          ref={panelRef}
          id={id}
          role="dialog"
          style={{
            position: "absolute",
            top: pos ? pos.top - (triggerRef.current?.getBoundingClientRect().bottom ?? 0) - window.scrollY + offset : offset,
            left: 0,
            ...(placement === "bottom-end" ? { right: 0, left: "auto" } : {}),
          }}
          className={cn(
            "z-50 min-w-[220px] rounded-lg bg-white shadow-[var(--shadow-pop)] border border-border-soft animate-pop-in",
            panelClassName,
          )}
        >
          {children({ close })}
        </div>
      )}
    </div>
  );
}
