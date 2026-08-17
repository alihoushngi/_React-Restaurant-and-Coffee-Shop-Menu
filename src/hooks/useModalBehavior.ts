import {
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";

interface BodyStyleSnapshot {
  position: string;
  top: string;
  right: string;
  left: string;
  width: string;
  overflow: string;
  paddingRight: string;
  scrollBehavior: string;
}

interface UseModalBehaviorOptions {
  isOpen: boolean;
  onClose: () => void;
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

let bodyScrollLockCount = 0;
let lockedScrollY = 0;
let bodyStyleSnapshot: BodyStyleSnapshot | null = null;

const acquireBodyScrollLock = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  bodyScrollLockCount += 1;
  if (bodyScrollLockCount > 1) return;

  const body = document.body;
  const root = document.documentElement;
  const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
  const currentPaddingRight =
    Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

  lockedScrollY = window.scrollY;
  bodyStyleSnapshot = {
    position: body.style.position,
    top: body.style.top,
    right: body.style.right,
    left: body.style.left,
    width: body.style.width,
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
    scrollBehavior: root.style.scrollBehavior,
  };

  body.style.position = "fixed";
  body.style.top = `-${lockedScrollY}px`;
  body.style.right = "0";
  body.style.left = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";

  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
  }
};

const releaseBodyScrollLock = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);
  if (bodyScrollLockCount > 0 || !bodyStyleSnapshot) return;

  const body = document.body;
  const root = document.documentElement;
  const snapshot = bodyStyleSnapshot;
  bodyStyleSnapshot = null;

  body.style.position = snapshot.position;
  body.style.top = snapshot.top;
  body.style.right = snapshot.right;
  body.style.left = snapshot.left;
  body.style.width = snapshot.width;
  body.style.overflow = snapshot.overflow;
  body.style.paddingRight = snapshot.paddingRight;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, lockedScrollY);
  root.style.scrollBehavior = snapshot.scrollBehavior;
};

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useBodyScrollLock(isLocked: boolean) {
  useIsomorphicLayoutEffect(() => {
    if (!isLocked) return;

    acquireBodyScrollLock();
    return releaseBodyScrollLock;
  }, [isLocked]);
}

export function useModalBehavior({
  isOpen,
  onClose,
  dialogRef,
  initialFocusRef,
}: UseModalBehaviorOptions) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusFrame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      const firstFocusable = dialog?.querySelector<HTMLElement>(
        focusableSelector,
      );
      (initialFocusRef?.current ?? firstFocusable ?? dialog)?.focus({
        preventScroll: true,
      });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [dialogRef, initialFocusRef, isOpen]);
}
