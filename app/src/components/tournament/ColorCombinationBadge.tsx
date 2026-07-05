interface ColorCombinationBadgeProps {
  comboName: string;
}

/** Live preview pill shown under the player form once colors are picked. */
export function ColorCombinationBadge({ comboName }: ColorCombinationBadgeProps) {
  return (
    <div className="rounded-md border border-gold/10 bg-gold/6 px-3 py-2 font-sans text-sm font-semibold text-gold">
      {comboName}
    </div>
  );
}
