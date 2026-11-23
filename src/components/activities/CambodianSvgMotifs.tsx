"use client";

export type MotifKind =
  | "mango"
  | "rambutan"
  | "banana"
  | "orange"
  | "longan"
  | "krama-red"
  | "krama-teal"
  | "krama-gold"
  | "lotus"
  | "jasmine"
  | "half-equal"
  | "half-unequal"
  | "quarter-equal"
  | "quarter-unequal"
  | "numeral";

export function MotifIcon({ kind, className = "h-10 w-10" }: { kind: string; className?: string }) {
  switch (kind) {
    case "rambutan":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
          <circle cx="20" cy="20" r="12" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <path
            d="M20 4 V9 M20 31 V36 M4 20 H9 M31 20 H36 M9 9 L13 13 M27 27 L31 31 M31 9 L27 13 M13 27 L9 31"
            stroke="#15803d"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "banana":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
          <path
            d="M8 26 C14 34, 29 30, 33 14 C30 19, 20 24, 10 21 Z"
            fill="#facc15"
            stroke="#a16207"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="33" cy="13" r="2" fill="#713f12" />
        </svg>
      );
    case "orange":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
          <circle cx="20" cy="22" r="12" fill="#fb923c" stroke="#c2410c" strokeWidth="2" />
          <path d="M20 10 C22 6, 26 6, 28 8 C25 10, 22 10, 20 10 Z" fill="#15803d" />
        </svg>
      );
    case "longan":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
          <circle cx="20" cy="21" r="11" fill="#d97706" stroke="#92400e" strokeWidth="2" />
          <circle cx="16" cy="17" r="2.5" fill="#fef3c7" fillOpacity="0.6" />
        </svg>
      );
    case "krama-red":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="6" fill="#be123c" />
          <rect x="4" y="14" width="32" height="12" fill="#fff1f2" fillOpacity="0.7" />
          <rect x="14" y="4" width="12" height="32" fill="#fff1f2" fillOpacity="0.55" />
          <rect x="14" y="14" width="12" height="12" fill="#881337" />
        </svg>
      );
    case "krama-teal":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="6" fill="#0f766e" />
          <rect x="4" y="14" width="32" height="12" fill="#f0fdfa" fillOpacity="0.7" />
          <rect x="14" y="4" width="12" height="32" fill="#f0fdfa" fillOpacity="0.55" />
          <rect x="14" y="14" width="12" height="12" fill="#134e4a" />
        </svg>
      );
    case "krama-gold":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
          <rect x="4" y="4" width="32" height="32" rx="6" fill="#d97706" />
          <rect x="4" y="14" width="32" height="12" fill="#fef3c7" fillOpacity="0.75" />
          <rect x="14" y="4" width="12" height="32" fill="#fef3c7" fillOpacity="0.55" />
          <rect x="14" y="14" width="12" height="12" fill="#92400e" />
        </svg>
      );
    case "lotus":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
          <path d="M20 7 C25 14, 25 24, 20 31 C15 24, 15 14, 20 7 Z" fill="#ec4899" />
          <path d="M10 15 C16 17, 19 24, 20 31 C13 28, 9 22, 10 15 Z" fill="#f472b6" />
          <path d="M30 15 C24 17, 21 24, 20 31 C27 28, 31 22, 30 15 Z" fill="#f472b6" />
        </svg>
      );
    case "jasmine":
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
          <circle cx="20" cy="11" r="6" fill="#ffffff" stroke="#0f766e" strokeWidth="1.5" />
          <circle cx="29" cy="20" r="6" fill="#ffffff" stroke="#0f766e" strokeWidth="1.5" />
          <circle cx="20" cy="29" r="6" fill="#ffffff" stroke="#0f766e" strokeWidth="1.5" />
          <circle cx="11" cy="20" r="6" fill="#ffffff" stroke="#0f766e" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="4.5" fill="#facc15" />
        </svg>
      );
    case "half-equal":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
          <rect
            x="4"
            y="8"
            width="20"
            height="32"
            rx="4"
            fill="#0f766e"
            stroke="#115e59"
            strokeWidth="2"
          />
          <rect
            x="24"
            y="8"
            width="20"
            height="32"
            rx="4"
            fill="#f0fdfa"
            stroke="#115e59"
            strokeWidth="2"
          />
        </svg>
      );
    case "half-unequal":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
          <rect
            x="4"
            y="8"
            width="12"
            height="32"
            rx="3"
            fill="#f59e0b"
            stroke="#92400e"
            strokeWidth="2"
          />
          <rect
            x="16"
            y="8"
            width="28"
            height="32"
            rx="3"
            fill="#fef3c7"
            stroke="#92400e"
            strokeWidth="2"
          />
        </svg>
      );
    case "quarter-equal":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
          <rect
            x="4"
            y="6"
            width="20"
            height="18"
            fill="#0f766e"
            stroke="#115e59"
            strokeWidth="2"
          />
          <rect
            x="24"
            y="6"
            width="20"
            height="18"
            fill="#f0fdfa"
            stroke="#115e59"
            strokeWidth="2"
          />
          <rect
            x="4"
            y="24"
            width="20"
            height="18"
            fill="#f0fdfa"
            stroke="#115e59"
            strokeWidth="2"
          />
          <rect
            x="24"
            y="24"
            width="20"
            height="18"
            fill="#f0fdfa"
            stroke="#115e59"
            strokeWidth="2"
          />
        </svg>
      );
    case "quarter-unequal":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
          <rect
            x="4"
            y="6"
            width="11"
            height="14"
            fill="#f59e0b"
            stroke="#92400e"
            strokeWidth="2"
          />
          <rect
            x="15"
            y="6"
            width="29"
            height="14"
            fill="#fef3c7"
            stroke="#92400e"
            strokeWidth="2"
          />
          <rect
            x="4"
            y="20"
            width="26"
            height="22"
            fill="#fef3c7"
            stroke="#92400e"
            strokeWidth="2"
          />
          <rect
            x="30"
            y="20"
            width="14"
            height="22"
            fill="#fef3c7"
            stroke="#92400e"
            strokeWidth="2"
          />
        </svg>
      );
    case "mango":
    default:
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
          <ellipse
            cx="20"
            cy="22"
            rx="13"
            ry="11"
            fill="#f59e0b"
            stroke="#b45309"
            strokeWidth="2"
          />
          <path d="M20 11 C21 6, 26 5, 28 8 C25 10, 22 11, 20 11 Z" fill="#15803d" />
          <circle cx="15" cy="18" r="2.2" fill="#ffffff" fillOpacity="0.45" />
        </svg>
      );
  }
}
