function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 7.9-11.3 7.9-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.1-5.1C33.5 5.9 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l5.9 4.3C13.7 15.3 18.5 12 24 12c3 0 5.8 1.1 7.9 3l5.1-5.1C33.5 5.9 29 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5 0 9.5-1.9 12.9-5l-5.9-4.9c-2 1.4-4.6 2.4-7 2.4-5.3 0-9.7-3.4-11.3-8l-6 4.6C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.3-2.2 4.2-4.1 5.6l5.9 4.9C40.4 35.4 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

export default function Button({ variant = "primary", children, className = "", ...props }) {
  const base = "w-full rounded-full font-serif transition flex items-center justify-center gap-2";

  const variants = {
    primary: "py-2 bg-accent hover:bg-accent-hover text-white text-base",
    google: "py-2.5 bg-surface-raised hover:bg-border text-white text-sm",
    disabled: "py-2 bg-gray-600 text-gray-300 cursor-not-allowed",
  };

  return (
    <button
      className={`${base} ${props.disabled ? variants.disabled : variants[variant]} ${className}`}
      {...props}
    >
      {variant === "google" && <GoogleIcon />}
      {children}
    </button>
  );
}