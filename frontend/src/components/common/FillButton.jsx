import { Link } from "react-router-dom";

const SIZES = {
  sm: "h-10 px-4 text-xs",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

const FillButton = ({
  children,
  to,                  // internal route  → renders <Link>
  href,                // external URL     → renders <a>
  onClick,
  type = "button",     // for <button> (e.g. "submit")
  variant = "primary", // "primary" | "secondary"
  size = "md",         // "sm" | "md" | "lg"
  disabled = false,
  target,              // e.g. "_blank" for external links
  className = "",
  ...rest
}) => {
  const primary = variant === "primary";

  const classes = [
    "group relative inline-flex items-center justify-center overflow-hidden rounded-2xl font-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none",
    SIZES[size] || SIZES.md,
    primary
      ? "bg-[var(--color-primary)] text-white shadow-[0_14px_28px_rgba(255,79,123,0.25)]"
      : "border border-gray-200 bg-white text-gray-900 shadow-[0_10px_25px_rgba(0,0,0,0.08)]",
    className,
  ].join(" ");

  const inner = (
    <>
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-0 transition-all duration-500 ease-out group-hover:w-full ${
          primary ? "bg-[var(--color-secondary)]" : "bg-[var(--color-primary)]"
        }`}
      />
      <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-white">
        {children}
      </span>
    </>
  );

  // 1) Internal navigation (react-router)
  if (to) {
    return (
      <Link to={to} onClick={onClick} className={classes} {...rest}>
        {inner}
      </Link>
    );
  }

  // 2) External link
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className={classes}
        {...rest}
      >
        {inner}
      </a>
    );
  }

  // 3) Plain button (forms, actions)
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...rest}>
      {inner}
    </button>
  );
};

export default FillButton;