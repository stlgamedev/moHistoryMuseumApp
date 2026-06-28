import type { ComponentChildren } from "preact";

interface Props {
  children: ComponentChildren;
  class?: string;
}

// 12-point starburst badge. The path is a unit star scaled to the viewBox;
// the heading text sits centered on top via the .badge wrapper.
export function StarburstBadge({ children, class: extra = "" }: Props) {
  return (
    <div class={`badge ${extra}`}>
      <svg class="badge__star" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <path
          fill="var(--badge)"
          d="M50 2 L58 16 L74 11 L73 28 L90 30 L80 44 L94 54 L78 60 L84 76 L67 74 L64 91 L50 81 L36 91 L33 74 L16 76 L22 60 L6 54 L20 44 L10 30 L27 28 L26 11 L42 16 Z"
        />
      </svg>
      <div class="badge__text">{children}</div>
    </div>
  );
}
