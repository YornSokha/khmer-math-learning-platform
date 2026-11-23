import type { ChildAvatarId } from "@/lib/server/validation";

export interface ChildAvatarMeta {
  id: ChildAvatarId;
  labelKm: string;
  bgClass: string;
}

export const CHILD_AVATARS: readonly ChildAvatarMeta[] = [
  { id: "mango", labelKm: "ស្វាយ", bgClass: "bg-amber-100" },
  { id: "lotus", labelKm: "ផ្កាឈូក", bgClass: "bg-pink-100" },
  { id: "elephant", labelKm: "ដំរី", bgClass: "bg-sky-100" },
  { id: "tuktuk", labelKm: "តុកតុក", bgClass: "bg-emerald-100" },
  { id: "star", labelKm: "ផ្កាយ", bgClass: "bg-yellow-100" },
  { id: "owl", labelKm: "ទីទុយ", bgClass: "bg-indigo-100" },
];

export interface ChildAvatarProps {
  avatarId: ChildAvatarId;
  size?: number;
}

export function ChildAvatar({ avatarId, size = 48 }: ChildAvatarProps) {
  const bgClass = CHILD_AVATARS.find((item) => item.id === avatarId)?.bgClass ?? "bg-amber-100";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-border ${bgClass}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" width={size * 0.75} height={size * 0.75}>
        {avatarId === "mango" && (
          <g>
            <ellipse cx="24" cy="27" rx="12" ry="15" fill="#F59E0B" />
            <ellipse cx="20" cy="23" rx="4" ry="7" fill="#FDE68A" opacity="0.65" />
            <path d="M24 12 C26 7, 32 7, 34 11 C29 12, 26 14, 24 12 Z" fill="#15803D" />
          </g>
        )}
        {avatarId === "lotus" && (
          <g>
            <ellipse cx="24" cy="24" rx="7" ry="14" fill="#EC4899" />
            <ellipse cx="16" cy="28" rx="6" ry="12" transform="rotate(-28 16 28)" fill="#F472B6" />
            <ellipse cx="32" cy="28" rx="6" ry="12" transform="rotate(28 32 28)" fill="#F472B6" />
            <circle cx="24" cy="30" r="4" fill="#FACC15" />
          </g>
        )}
        {avatarId === "elephant" && (
          <g>
            <circle cx="13" cy="24" r="8" fill="#60A5FA" />
            <circle cx="35" cy="24" r="8" fill="#60A5FA" />
            <circle cx="24" cy="24" r="11" fill="#3B82F6" />
            <path
              d="M24 28 C24 35, 29 37, 31 34"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="20" cy="22" r="2" fill="#FFFFFF" />
            <circle cx="28" cy="22" r="2" fill="#FFFFFF" />
          </g>
        )}
        {avatarId === "tuktuk" && (
          <g>
            <rect x="8" y="16" width="28" height="16" rx="4" fill="#059669" />
            <rect x="12" y="19" width="12" height="7" rx="2" fill="#D1FAE5" />
            <rect x="26" y="19" width="7" height="7" rx="2" fill="#FEF3C7" />
            <circle cx="15" cy="34" r="4.5" fill="#1F2937" />
            <circle cx="31" cy="34" r="4.5" fill="#1F2937" />
          </g>
        )}
        {avatarId === "star" && (
          <polygon
            points="24,6 29.2,17.2 41.5,18.7 32.4,27.1 34.8,39.3 24,33.2 13.2,39.3 15.6,27.1 6.5,18.7 18.8,17.2"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}
        {avatarId === "owl" && (
          <g>
            <ellipse cx="24" cy="26" rx="13" ry="14" fill="#4F46E5" />
            <circle cx="19" cy="22" r="5" fill="#FFFFFF" />
            <circle cx="29" cy="22" r="5" fill="#FFFFFF" />
            <circle cx="19" cy="22" r="2.2" fill="#1E1B4B" />
            <circle cx="29" cy="22" r="2.2" fill="#1E1B4B" />
            <polygon points="24,25 21,29 27,29" fill="#F59E0B" />
          </g>
        )}
      </svg>
    </span>
  );
}
