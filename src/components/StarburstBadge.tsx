import type { ComponentChildren } from "preact";

interface Props {
  children: ComponentChildren;
  class?: string;
}

// 12-lobe rounded starburst badge (traced from the design mockup). The heading
// text sits centered on top via the .badge wrapper, constrained to the shape's
// rounded interior so it clears the points.
export function StarburstBadge({ children, class: extra = "" }: Props) {
  return (
    <div class={`badge ${extra}`}>
      <svg class="badge__star" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <path
          fill="var(--badge)"
          d="M 101.98 198.00 L 92.58 194.54 L 80.20 172.26 L 57.43 186.12 L 49.52 184.14 L 47.04 180.68 L 47.04 153.95 L 20.81 153.45 L 14.37 148.01 L 14.37 141.08 L 27.24 119.30 L 7.94 108.91 L 2.49 103.46 L 2.49 96.54 L 6.95 92.08 L 27.24 80.70 L 14.37 58.92 L 15.36 51.00 L 21.80 46.55 L 46.55 47.54 L 47.04 19.32 L 51.49 14.87 L 59.41 14.87 L 80.20 27.74 L 91.59 7.44 L 99.01 2.00 L 103.96 2.99 L 108.41 7.44 L 119.80 27.74 L 140.59 14.87 L 148.51 14.87 L 152.96 20.31 L 152.96 46.05 L 178.20 46.55 L 185.63 52.98 L 185.63 58.92 L 172.76 80.70 L 193.05 92.08 L 197.51 97.53 L 197.51 102.47 L 192.06 108.91 L 172.76 119.30 L 185.63 142.07 L 184.64 149.00 L 179.19 153.45 L 153.45 153.45 L 152.96 179.69 L 146.53 186.12 L 142.57 186.12 L 118.81 173.25 L 108.41 192.56 L 101.98 198.00 Z"
        />
      </svg>
      <div class="badge__text">{children}</div>
    </div>
  );
}
