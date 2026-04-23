export function BrandLogo({
  size = 32,
  thinStrokeOpacity = 0.75,
}: {
  size?: number;
  thinStrokeOpacity?: number;
}) {
  const thin = size * (2.6 / 32);
  const thick = size * (4 / 32);
  const dotR = size * (2.6 / 32);
  const innerDotR = size * (1.4 / 32);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 6.5 9 L 14.5 23"
        stroke="#ffffff"
        strokeOpacity={thinStrokeOpacity}
        strokeWidth={thin}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 14.5 23 L 26 5"
        stroke="#ffffff"
        strokeWidth={thick}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="26" cy="5" r={dotR} fill="#F5F3FF" />
      <circle cx="26" cy="5" r={innerDotR} fill="#7C3AED" />
    </svg>
  );
}
