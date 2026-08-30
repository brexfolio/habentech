interface SellIconProps {
  size?: number;
  className?: string;
}

export default function SellIcon({ size = 22, className }: SellIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M17 15.63a4.375 4.375 0 0 0-3.309-4.241l-2.9-.718A2.371 2.371 0 0 1 11.37 6h1.26a2.37 2.37 0 0 1 2.356 2.112 1 1 0 0 0 1.988-.224 4.36 4.36 0 0 0-4.014-3.857V3a1 1 0 0 0-2 0v1.041a4.359 4.359 0 0 0-.651 8.57l2.9.718A2.372 2.372 0 0 1 12.63 18h-1.26a2.37 2.37 0 0 1-2.356-2.112 1 1 0 0 0-1.988.224 4.36 4.36 0 0 0 3.934 3.85V21a1 1 0 0 0 2 0v-1.032A4.344 4.344 0 0 0 17 15.63"
        fill="currentColor"
      />
    </svg>
  );
}
