'use client'

// Coordinates normalized from the original 680×280 SVG:
// icon box was at x=240,y=40 w=200 h=200 → shifted to 0,0 in a 200×200 viewBox
function LifeLensIcon({ size, uid }: { size: number; uid: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${uid}-clip`}>
          <rect x="0" y="0" width="200" height="200" rx="48" />
        </clipPath>
      </defs>

      {/* Background square */}
      <rect x="0" y="0" width="200" height="200" rx="48" fill="#0d9488" />

      {/* Left circle */}
      <circle
        cx="70"
        cy="100"
        r="48"
        fill="none"
        stroke="white"
        strokeWidth="5"
        clipPath={`url(#${uid}-clip)`}
      />
      {/* Right circle */}
      <circle
        cx="130"
        cy="100"
        r="48"
        fill="none"
        stroke="white"
        strokeWidth="5"
        clipPath={`url(#${uid}-clip)`}
      />

      {/* Vesica lens fill — intersection of the two circles */}
      <path
        d="M100,62 C114,72 122,86 122,100 C122,114 114,128 100,138 C86,128 78,114 78,100 C78,86 86,72 100,62 Z"
        fill="white"
      />

      {/* Center pupil */}
      <circle cx="100" cy="100" r="10" fill="#0d9488" />
    </svg>
  )
}

// ── Public components ─────────────────────────────────────────────────────────

export function LogoMark({
  size = 28,
  uid = 'lm',
}: {
  size?: number
  uid?: string
}) {
  return <LifeLensIcon size={size} uid={uid} />
}

export function LogoFull({
  size = 28,
  uid = 'lf',
}: {
  size?: number
  uid?: string
}) {
  return (
    <div className="flex items-center" style={{ gap: size * 0.35 }}>
      <LifeLensIcon size={size} uid={uid} />
      <span
        style={{
          fontSize: size * 0.5,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          lineHeight: 1,
        }}
      >
        LifeLens
      </span>
    </div>
  )
}
