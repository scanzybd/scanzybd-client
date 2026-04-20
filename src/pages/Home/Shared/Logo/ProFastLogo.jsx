import React from "react";
import { PRODUCT_NAME, LOGO_TEXT_COLOR } from "../../../../config/company";

/**
 * Navbar wordmark — text comes from VITE_PRODUCT_NAME.
 * Color: set `VITE_LOGO_TEXT_COLOR` in `.env` (e.g. #1c1917), or pass `textClassName` (Tailwind).
 */
const ProFastLogo = ({
  className = "",
  /** Used when VITE_LOGO_TEXT_COLOR is empty — default suits yellow navbar */
  textClassName = "text-yellow-950",
}) => {
  const useEnvColor = Boolean(LOGO_TEXT_COLOR);

  return (
    <div className={`flex items-center ${className}`}>
      <span
        className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${
          useEnvColor ? "" : textClassName
        }`}
        style={useEnvColor ? { color: LOGO_TEXT_COLOR } : undefined}
      >
        {PRODUCT_NAME}
      </span>
    </div>
  );
};

export default ProFastLogo;
