"use client";;
import React from "react";

// Inline CSS as a string
const styles = `
.chronicleButton {
  --chronicle-button-border-radius: 8px;
  border-radius: var(--chronicle-button-border-radius);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 0.8rem 1.2rem;
  cursor: pointer;
  border: none;
  font-weight: 700;
  background: var(--chronicle-button-background);
  color: var(--chronicle-button-foreground);
  transition: all 0.3s ease;
  position: relative;
  min-height: 48px;
  box-sizing: border-box;
  text-align: center;
  white-space: nowrap;
  flex-shrink: 0;
}

.chronicleButton:hover {
  background: var(--chronicle-button-hover-background);
  color: var(--chronicle-button-hover-foreground);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chronicleButton:active {
  transform: translateY(0);
}

.chronicleButton .content-wrapper {
  display: block;
  width: 100%;
}

.chronicleButton .hover-content {
  display: none; /* Simplified for now to ensure visibility */
}

.chronicleButton em {
  font-style: normal;
  display: block;
  font-size: 1rem;
  color: inherit;
}

.chronicleButton.outlined {
  background: transparent;
  border: 2px solid var(--chronicle-button-background);
  color: var(--chronicle-button-background);
}

.chronicleButton.outlined:hover {
  background: var(--chronicle-button-background);
  color: var(--chronicle-button-foreground);
}

.chronicleButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;

export const ChronicleButton = React.forwardRef(({
  text,
  children,
  onClick,
  type = 'button',
  disabled = false,
  hoverColor = "#a594fd",
  width = "160px",
  outlined = false,
  outlinePaddingAdjustment = "2px",
  borderRadius = "8px",
  outlinedButtonBackgroundOnHover = "transparent",
  customBackground = "#fff",
  customForeground = "#111014",
  hoverForeground = "#111014",
  className = "",
  style = {},
  ...props
}, ref) => {
  // Inject styles once
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.getElementById("chronicle-button-style")) {
      const styleElement = document.createElement("style");
      styleElement.id = "chronicle-button-style";
      styleElement.innerHTML = styles;
      document.head.appendChild(styleElement);
    }
  }, []);

  const buttonStyle = {
    "--chronicle-button-background": customBackground,
    "--chronicle-button-foreground": customForeground,
    "--chronicle-button-hover-background": hoverColor,
    "--chronicle-button-hover-foreground": hoverForeground,
    "--outline-padding-adjustment": outlinePaddingAdjustment,
    "--chronicle-button-border-radius": borderRadius,
    "--outlined-button-background-on-hover": outlinedButtonBackgroundOnHover,
    width: width,
    borderRadius: borderRadius,
    ...style
  };

  const displayText = children ? children : text;

  return (
    <button
      ref={ref}
      className={`chronicleButton ${outlined ? "outlined" : ""} ${className}`}
      onClick={onClick}
      style={buttonStyle}
      type={type}
      disabled={disabled}
      {...props}
    >
      <span className="content-wrapper">
        <em>{displayText}</em>
      </span>
    </button>
  );
});

ChronicleButton.displayName = "ChronicleButton";

export default ChronicleButton;