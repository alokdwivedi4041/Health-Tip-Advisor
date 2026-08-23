import "../styles/chat.css";

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
    <div className="chat-quick-replies">
      {SUGGESTIONS.map((text) => (
        <button key={text} onClick={() => onSelect(text)} disabled={disabled}>
          {text}
        </button>
      ))}
    </div>
  );
}

export default QuickReplies;