"use client";

import { useEffect } from "react";

const ZOOM_KEYS = new Set([
  "+",
  "-",
  "=",
  "0",
  "NumpadAdd",
  "NumpadSubtract",
  "Numpad0",
]);

export function DisableZoom() {
  useEffect(() => {
    const preventZoom = (event: Event) => {
      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && ZOOM_KEYS.has(event.key)) {
        event.preventDefault();
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    const preventPinchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const previousTouchAction = document.documentElement.style.touchAction;
    document.documentElement.style.touchAction = "manipulation";

    document.addEventListener("keydown", handleKeyDown, { passive: false });
    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("gesturestart", preventZoom as EventListener, {
      passive: false,
    });
    document.addEventListener("gesturechange", preventZoom as EventListener, {
      passive: false,
    });
    document.addEventListener("gestureend", preventZoom as EventListener, {
      passive: false,
    });
    // Bloquear pinch-to-zoom táctil (iOS y Android)
    document.addEventListener("touchstart", preventPinchZoom as EventListener, {
      passive: false,
    });
    document.addEventListener("touchmove", preventPinchZoom as EventListener, {
      passive: false,
    });

    return () => {
      document.documentElement.style.touchAction = previousTouchAction;
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("gesturestart", preventZoom as EventListener);
      document.removeEventListener("gesturechange", preventZoom as EventListener);
      document.removeEventListener("gestureend", preventZoom as EventListener);
      document.removeEventListener("touchstart", preventPinchZoom as EventListener);
      document.removeEventListener("touchmove", preventPinchZoom as EventListener);
    };
  }, []);

  return null;
}

export default DisableZoom;
