import React, { useEffect, useRef, useState } from "react";

const Popper = ({ isOpen, targetRef, children }) => {
  const popperRef = useRef(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    placement: "bottom",
  });

  useEffect(() => {
    if (!isOpen || !targetRef?.current || !popperRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const popperEl = popperRef.current;
    const popperHeight = popperEl.offsetHeight;
    const popperWidth = popperEl.offsetWidth;

    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;

    const shouldPlaceOnTop =
      popperHeight > spaceBelow && spaceAbove > spaceBelow;

    const top = shouldPlaceOnTop
      ? targetRect.top - popperHeight
      : targetRect.bottom;

    const left = targetRect.left + (targetRect.width - popperWidth) / 2;

    setPosition({
      top: Math.max(0, top + window.scrollY),
      left: Math.max(0, left + window.scrollX),
      placement: shouldPlaceOnTop ? "top" : "bottom",
    });
  }, [isOpen, targetRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={popperRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        background: "white",
        border: "1px solid #ccc",
        padding: "8px 12px",
        borderRadius: "4px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  );
};

export default Popper;
