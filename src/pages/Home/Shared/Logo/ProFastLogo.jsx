import React from "react";
import logoWordmark from "../../../../assets/logo/Logo-Solid Color.svg";

/**
 * Navbar wordmark using the latest brand asset.
 */
const ProFastLogo = ({
  className = "",
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoWordmark}
        alt="ScanzyBD"
        className="h-9 w-auto sm:h-10"
        draggable={false}
      />
    </div>
  );
};

export default ProFastLogo;
