import React, { useEffect, useRef, useState } from "react";

const Popper = ({
  isOpen,
  targetRef,
  children,
  preferredPlacement = "auto",
  onClose,
}) => {
  const popperRef = useRef(null);
  const containerRef = useRef(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    placement: "bottom",
  });
  const [visible, setVisible] = useState(false);

  const placements = ["bottom", "top", "right", "left"];

  const calculatePosition = () => {
    if (!targetRef?.current || !popperRef.current) return;

    const target = targetRef.current.getBoundingClientRect();
    const popper = popperRef.current;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const space = {
      top: target.top,
      bottom: window.innerHeight - target.bottom,
      left: target.left,
      right: window.innerWidth - target.right,
    };

    let placement = preferredPlacement;
    if (preferredPlacement === "auto") {
      placement =
        placements.find((p) => {
          if (p === "top") return popper.offsetHeight + 8 < space.top;
          if (p === "bottom") return popper.offsetHeight + 8 < space.bottom;
          if (p === "left") return popper.offsetWidth + 8 < space.left;
          if (p === "right") return popper.offsetWidth + 8 < space.right;
          return false;
        }) || "bottom";
    }

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = target.top + scrollY - popper.offsetHeight - 0;
        left = target.left + scrollX + (target.width - popper.offsetWidth) / 2;
        break;
      case "bottom":
        top = target.bottom + scrollY + 0;
        left = target.left + scrollX + (target.width - popper.offsetWidth) / 2;
        break;
      case "left":
        top = target.top + scrollY + (target.height - popper.offsetHeight) / 2;
        left = target.left + scrollX - popper.offsetWidth - 0;
        break;
      case "right":
        top = target.top + scrollY + (target.height - popper.offsetHeight) / 2;
        left = target.right + scrollX + 0;
        break;
    }

    const margin = 8;
    const clampedLeft = Math.max(
      margin,
      Math.min(left, scrollX + window.innerWidth - popper.offsetWidth - margin)
    );
    const clampedTop = Math.max(
      margin,
      Math.min(top, scrollY + window.innerHeight - popper.offsetHeight - margin)
    );

    setPosition({
      top: clampedTop,
      left: clampedLeft,
      placement,
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    calculatePosition();
    setVisible(true);

    const handleResizeScroll = () => {
      setVisible(false);
      requestAnimationFrame(() => {
        calculatePosition();
        setVisible(true);
      });
    };

    window.addEventListener("resize", handleResizeScroll);
    window.addEventListener("scroll", handleResizeScroll, true);

    return () => {
      window.removeEventListener("resize", handleResizeScroll);
      window.removeEventListener("scroll", handleResizeScroll, true);
    };
  }, [isOpen, preferredPlacement]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !targetRef.current?.contains(e.target)
      ) {
        onClose?.();
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, targetRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.95)",
        transition: "opacity 150ms ease, transform 150ms ease",
        maxWidth: "90vw",
      }}
    >
      <div
        ref={popperRef}
        style={{
          background: "white",
          border: "1px solid #ccc",
          padding: "8px 12px",
          borderRadius: "4px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          overflowWrap: "break-word",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Popper;
