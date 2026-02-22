import { severityColor } from "../../lib/utils";

const SEV_LABELS = ["", "Minimal", "Mild", "Moderate", "Severe", "Critical"];

interface SeverityBadgeProps {
  value: number;
  showLabel?: boolean;
}

export default function SeverityBadge({
  value,
  showLabel = true,
}: SeverityBadgeProps) {
  const color = severityColor(value);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          boxShadow: value >= 4 ? `0 0 6px ${color}` : "none",
        }}
      />
      <span
        style={{
          color,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {value}/5
      </span>
      {showLabel && (
        <span style={{ color: "var(--text3)", fontSize: 11 }}>
          {SEV_LABELS[value]}
        </span>
      )}
    </span>
  );
}
