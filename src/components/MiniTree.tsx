import type { TreeDef } from "../game/types";

export function MiniTree({ tree, locked }: { tree: TreeDef; locked: boolean }) {
  const leaf = locked ? "#8a9a8a" : tree.leaf;
  const leafL = locked ? "#a4b3a4" : tree.leafLight;
  const fruit = locked ? "#77857a" : tree.fruit;
  const ink = locked ? "#5c615c" : "#2e6b33";
  return (
    <svg width="58" height="58" viewBox="0 0 64 64" aria-hidden>
      <ellipse cx="32" cy="56" rx="16" ry="4" fill="rgba(30,77,40,0.25)" />
      <path d="M29 56 Q29 42 31 34 L33 34 Q35 42 35 56 Z" fill={locked ? "#7a7f7a" : "#8b5a2b"} stroke={locked ? "#5c615c" : "#5c3a1e"} strokeWidth="2" />
      <circle cx="32" cy="24" r="15" fill={leaf} stroke={ink} strokeWidth="2.4" />
      <circle cx="21" cy="29" r="9" fill={leaf} />
      <circle cx="43" cy="29" r="9" fill={leaf} />
      <circle cx="28" cy="19" r="8" fill={leafL} />
      <circle cx="26" cy="26" r="3.4" fill={fruit} stroke={locked ? "#5c615c" : tree.fruitDark} strokeWidth="1.6" />
      <circle cx="38" cy="22" r="3.4" fill={fruit} stroke={locked ? "#5c615c" : tree.fruitDark} strokeWidth="1.6" />
      <circle cx="35" cy="31" r="3.4" fill={fruit} stroke={locked ? "#5c615c" : tree.fruitDark} strokeWidth="1.6" />
    </svg>
  );
}
