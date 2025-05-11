import React, { useRef, useState } from "react";
import { Popper } from "../../src";

const PopperComponent = () => {
  const buttonRef = useRef(null);
  const [showPopper, setShowPopper] = useState(false);

  return (
    <div style={{ padding: "100px" }}>
      <button ref={buttonRef} onClick={() => setShowPopper((prev) => !prev)}>
        Toggle Popper
      </button>

      <Popper isOpen={showPopper} targetRef={buttonRef}>
        <div>This is the popper content!</div>
      </Popper>
    </div>
  );
};

export default PopperComponent;
