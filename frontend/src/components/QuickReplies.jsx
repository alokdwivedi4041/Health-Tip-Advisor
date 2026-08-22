const SUGGESTIONS = [
  "Healthy breakfast ideas",
  "Tips for better sleep",
  "Daily hydration tips",
  "Simple exercise tips",
  "Stress management tips",
  "Healthy eating habits",
];

function QuickReplies({ onSelect, disabled }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
      {SUGGESTIONS.map((text) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          disabled={disabled}
          style={{
            padding: "6px 12px",
            borderRadius: "16px",
            border: "1px solid #ccc",
            background: "#f5f5f5",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "13px",
          }}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export default QuickReplies;