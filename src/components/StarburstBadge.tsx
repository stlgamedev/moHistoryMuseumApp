import type { ComponentChildren } from "preact";

interface Props {
  children: ComponentChildren;
  class?: string;
}

// 12-lobe rounded starburst badge — vector traced from the design asset
// (backgroundelement.png). The heading text sits centered on top via the
// .badge wrapper, constrained to the shape's rounded interior so it clears
// the points. fill="var(--badge)" so it tracks the theme.
export function StarburstBadge({ children, class: extra = "" }: Props) {
  return (
    <div class={`badge ${extra}`}>
      <svg class="badge__star" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <path
          fill="var(--badge)"
          d="M 100.92 198.00 L 96.17 197.21 L 92.60 194.17 L 80.58 172.64 L 58.92 185.32 L 53.38 185.85 L 49.94 184.26 L 47.43 181.23 L 46.64 179.11 L 46.91 153.23 L 21.42 153.36 L 17.98 152.04 L 16.00 150.32 L 13.89 145.57 L 14.42 141.34 L 27.36 119.42 L 5.57 107.13 L 3.06 104.36 L 2.00 101.19 L 2.53 96.70 L 5.83 92.60 L 27.36 80.58 L 14.42 58.66 L 13.89 54.17 L 15.74 49.94 L 18.25 47.70 L 21.15 46.64 L 46.77 46.91 L 46.64 20.89 L 48.23 17.45 L 52.32 14.42 L 54.43 13.89 L 58.40 14.42 L 80.58 27.36 L 92.60 5.83 L 95.11 3.32 L 98.55 2.00 L 103.83 2.79 L 107.13 5.57 L 119.42 27.36 L 140.81 14.68 L 145.57 13.89 L 147.68 14.42 L 150.58 16.26 L 152.04 17.98 L 153.36 21.42 L 153.09 46.77 L 179.11 46.64 L 181.23 47.43 L 184.00 49.68 L 185.85 53.38 L 185.58 58.40 L 172.64 80.58 L 194.43 92.87 L 196.68 95.38 L 198.00 99.60 L 197.21 103.57 L 194.70 106.87 L 172.64 119.42 L 185.58 141.60 L 185.85 146.62 L 184.53 149.53 L 181.49 152.30 L 178.58 153.36 L 153.23 153.09 L 153.36 178.58 L 151.77 182.28 L 149.00 184.79 L 146.62 185.85 L 141.60 185.58 L 119.42 172.64 L 107.13 194.43 L 104.62 196.68 L 100.92 198.00 Z"
        />
      </svg>
      <div class="badge__text">{children}</div>
    </div>
  );
}
