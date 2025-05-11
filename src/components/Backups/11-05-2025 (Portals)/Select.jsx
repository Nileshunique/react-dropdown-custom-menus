import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import "./select.css"; // Import the CSS file

const Select = ({
  label,
  value,
  onChange,
  options = [],
  className,
  placeholder,
  disabled,
  required,
  error,
  helperText,
  ...rest
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [searchedValue, setSearchedValue] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 300,
    placement: "bottom",
  });

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const portalRoot = useRef(
    document.getElementById("portal-root") ||
      (() => {
        const el = document.createElement("div");
        el.id = "portal-root";
        document.body.appendChild(el);
        return el;
      })()
  );

  // Calculate dropdown position with smart placement
  const calculateDropdownPosition = useCallback(() => {
    if (!inputRef.current)
      return {
        top: 0,
        left: 0,
        width: 0,
        maxHeight: 300,
        placement: "bottom",
      };

    const rect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Default max height for dropdown
    const defaultMaxHeight = 300;

    // Check if there's more space above or below the input
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Choose placement based on available space
    const placement =
      spaceBelow >= Math.min(defaultMaxHeight, spaceAbove) || spaceBelow >= 150
        ? "bottom"
        : "top";

    // Calculate position and dimensions based on placement
    let top, maxHeight;

    if (placement === "bottom") {
      top = rect.bottom + window.scrollY;
      maxHeight = Math.min(defaultMaxHeight, spaceBelow - 10);
    } else {
      // Place above the input
      maxHeight = Math.min(defaultMaxHeight, spaceAbove - 10);
      top = rect.top + window.scrollY - maxHeight;
    }

    // Ensure left alignment, but prevent overflow on the right
    let left = rect.left + window.scrollX;
    if (left + rect.width > viewportWidth) {
      left = viewportWidth - rect.width - 10;
    }

    return {
      top,
      left,
      width: rect.width,
      maxHeight: Math.max(maxHeight, 100), // Ensure minimum height
      placement,
    };
  }, []);

  // Handle focus management
  const handleOnFocus = useCallback(() => {
    if (disabled) return;

    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsFocus(true);
    rest?.onFocus?.();
  }, [disabled, rest]);

  const handleOnBlur = useCallback(() => {
    // Store timeout ID in ref so we can cancel it if needed
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocus(false);
      blurTimeoutRef.current = null;
      rest?.onBlur?.();
    }, 300);
  }, [rest]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsFocus(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update dropdown position when focused or window resized
  useEffect(() => {
    const updatePosition = () => {
      if (isFocus) {
        const position = calculateDropdownPosition();
        setDropdownPosition(position);
      }
    };

    // Update position immediately when focusing
    if (isFocus) {
      updatePosition();
    }

    // Add resize and scroll event listeners
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    // Cleanup listeners
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isFocus, calculateDropdownPosition]);

  // Clear search field
  const handleOnClear = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();

    // Cancel any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    // Clear the search value immediately
    setSearchedValue("");

    // Ensure focus remains
    setIsFocus(true);
    // Keep focus on the input
    inputRef.current?.focus();
  }, []);

  const handleOnChange = useCallback((e) => {
    setSearchedValue(e.target.value);
  }, []);

  const handleOnClick = useCallback(
    (e, option) => {
      e.preventDefault();
      e.stopPropagation();

      if (option.disabled) return;

      const event = {
        ...e,
        target: { ...e.target, value: option.value, option },
      };
      setIsFocus(false);
      setSearchedValue(""); // Clear search after selection
      onChange(event);
    },
    [onChange]
  );

  // Toggle dropdown
  const handleDropdownIconClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (disabled) return;

      if (isFocus) {
        handleOnBlur();
      } else {
        handleOnFocus();
        inputRef.current?.focus();
      }
    },
    [isFocus, handleOnFocus, handleOnBlur, disabled]
  );

  // Get the display value
  const getValue = useMemo(() => {
    const option = options.find((item) => item.value === value);
    return option?.label || value || "";
  }, [value, options]);

  // Filter options based on search
  const filteredItems = useMemo(() => {
    const filtered =
      options?.filter((item) =>
        item.label?.toLowerCase().includes(searchedValue.toLowerCase())
      ) || [];
    return filtered.length > 0
      ? filtered
      : searchedValue
      ? [{ label: "No option found", value: "no-option", disabled: true }]
      : [{ label: "No option provided", value: "no-option", disabled: true }];
  }, [options, searchedValue]);

  return (
    <div
      className={`searchable-dropdown-container ${className || ""} ${
        error ? "error" : ""
      }`}
      ref={containerRef}
    >
      <div
        className={`searchable-dropdown-field ${isFocus ? "focused" : ""} ${
          disabled ? "disabled" : ""
        }`}
      >
        <label
          className={`dropdown-label ${
            isFocus || (isFocus ? searchedValue : getValue)
              ? "label-active"
              : ""
          }`}
        >
          {label}
          {required && <span className="required-mark">*</span>}
        </label>

        <input
          {...rest}
          ref={inputRef}
          className="dropdown-input"
          type="text"
          disabled={disabled}
          autoComplete="off"
          placeholder={isFocus ? placeholder : ""}
          onChange={handleOnChange}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          value={isFocus ? searchedValue : getValue}
          required={required}
        />

        <div className="dropdown-icons">
          {isFocus && searchedValue ? (
            <button
              className="icon-button clear-button"
              onClick={handleOnClear}
              type="button"
              tabIndex="-1"
            >
              ✕
            </button>
          ) : (
            <button
              className="icon-button arrow-button"
              onClick={handleDropdownIconClick}
              type="button"
              tabIndex="-1"
            >
              {isFocus ? "▲" : "▼"}
            </button>
          )}
        </div>
      </div>

      {error && helperText && (
        <div className="helper-text error">{helperText}</div>
      )}

      {isFocus &&
        ReactDOM.createPortal(
          <div
            className={`dropdown-menu ${dropdownPosition.placement}`}
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              maxHeight: `${dropdownPosition.maxHeight}px`,
            }}
          >
            <ul className="menu-list">
              {filteredItems.map((option, index) => {
                const { value: optionValue, label, disabled } = option;
                return (
                  <li
                    key={`${optionValue}-${index}`}
                    className={`menu-item ${
                      optionValue === value ? "selected" : ""
                    } ${disabled ? "disabled" : ""}`}
                    onClick={(e) => handleOnClick(e, option)}
                  >
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>,
          portalRoot.current
        )}
    </div>
  );
};

export default Select;

Select.propTypes = {
  value: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
      disabled: PropTypes.bool,
    })
  ),
  label: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
};
