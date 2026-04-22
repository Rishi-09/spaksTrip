export default function Logo() {
  return (
    <a href="/" aria-label="Spakstrip home" className="flex items-center gap-2">
      <svg
        viewBox="0 0 64 36"
        width={48}
        height={28}
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M2 26 C 18 4, 46 4, 62 14"
          stroke="#1F86C7"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M4 30 C 22 14, 50 14, 60 22"
          stroke="#E0742E"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M40 6 L60 14 L52 18 L46 16 L42 22 L38 20 L42 14 Z"
          fill="#1F86C7"
        />
      </svg>
      <span className="font-extrabold tracking-wide text-[#0E1E3A] text-xl">
        SPAKSTRIP
      </span>
    </a>
  );
}
