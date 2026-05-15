import { useState } from "react";

export const getInitials = (name = "") => {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

type AvatarSize = "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge" | number;

interface AvatarProps {
  src?: string;
  alt?: string;
  nameForInitials?: string;
  size?: AvatarSize; // px or preset
  className?: string;
  status?: "online" | "offline" | "busy";
}

const sizeMap: Record<string, number> = {
  xsmall: 24,
  small: 32,
  medium: 40,
  large: 48,
  xlarge: 56,
  xxlarge: 64,
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  nameForInitials,
  size = 40,
  className = "",
  status: _status, // Accepted but not yet implemented
}) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  const sizeInPx = typeof size === "string" ? sizeMap[size] || 40 : size;
  const dim = `${sizeInPx}px`;
  const initials = getInitials(nameForInitials || alt || "").trim() || "U";

  if (showImage) {
    return (
      <img
        src={src}
        alt={alt || "User avatar"}
        className={`rounded-full object-cover ${className}`}
        style={{ width: dim, height: dim }}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center border border-black/40 dark:border-white/40 bg-neutral-100 dark:bg-transparent  text-neutral-900 dark:text-neutral-100"
      style={{ width: dim, height: dim }}
      aria-label={alt || "User avatar"}
      role="img"
    >
      <span className="font-medium text-sm">{initials}</span>
    </div>
  );
};

export default Avatar;
