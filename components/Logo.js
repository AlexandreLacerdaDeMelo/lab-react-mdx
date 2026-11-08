export default function Logo({ variant = "full", titleId, size = 28, className, alt = "Aurora Studio" }) {
  const gradientId = `${titleId}-aurora`;

  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
      <svg
        role="img"
        aria-labelledby={titleId}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
      >
        <title id={titleId}>{alt}</title>
        <defs>
          <linearGradient id={gradientId} x1="8" y1="14" x2="40" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--violet)" />
            <stop offset="1" stopColor="var(--azure)" />
          </linearGradient>
        </defs>
        {/* corpo da câmera */}
        <rect x="5" y="16" width="38" height="24" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M16 16 L20 10 H28 L32 16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        {/* lente formada por arcos de aurora */}
        <circle cx="24" cy="28" r="10" stroke={`url(#${gradientId})`} strokeWidth="2" />
        <path d="M16 23 A10 10 0 0 1 32 23" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
        <path d="M15 31 A10 10 0 0 0 33 31" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <circle cx="24" cy="28" r="4" fill={`url(#${gradientId})`} />
        {/* ponto de gravação */}
        <circle cx="37" cy="21" r="2.2" fill="var(--accent)" />
      </svg>
      {variant === "full" ? (
        <span style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", letterSpacing: "0.01em" }}>
          Aurora Studio
        </span>
      ) : null}
    </span>
  );
}
