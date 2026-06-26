import { useState } from "react";
import axios from "axios";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export default function App() {
  const [brandName, setBrandName] = useState("");
  const [brandContent, setBrandContent] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!brandName.trim() || !brandContent.trim()) {
      setError("Brand name आणि content दोन्ही भरा.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const prompt = `
You are a brand strategist. Analyze the following brand content and return a JSON object only, no explanation, no markdown.

Brand Name: ${brandName}
Brand Content (captions, bio, website copy): ${brandContent}

Return this exact JSON structure:
{
  "tone": "describe the brand tone in 3-4 words",
  "personality": "one sentence describing brand personality",
  "vocabulary": {
    "uses": ["word1", "word2", "word3"],
    "avoids": ["word1", "word2", "word3"]
  },
  "hookStyle": "describe what kind of hooks work for this brand",
  "sampleCaption": "write one sample short-form video caption for this brand",
  "videoContentIdeas": ["idea1", "idea2", "idea3"]
}
`;

    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const text = response.data.choices[0].message.content;
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      setError("Something went wrong. API key check कर.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Brand Voice Analyzer</h1>
        <p style={styles.subtitle}>
          Paste your brand content → get your brand voice card
        </p>
      </div>

      <div style={styles.card}>
        <input
          style={styles.input}
          placeholder="Brand Name (e.g. Mamaearth)"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
        />
        <textarea
          style={styles.textarea}
          placeholder="Paste brand content here — Instagram bio, captions, website copy, taglines..."
          value={brandContent}
          onChange={(e) => setBrandContent(e.target.value)}
          rows={6}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button
          style={loading ? styles.buttonDisabled : styles.button}
          onClick={analyze}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Brand Voice →"}
        </button>
      </div>

      {result && (
        <div style={styles.resultContainer}>
          <h2 style={styles.resultTitle}>
            Brand Voice Card — {brandName}
          </h2>

          <div style={styles.grid}>
            <div style={styles.resultCard}>
              <h3 style={styles.label}>Tone</h3>
              <p style={styles.value}>{result.tone}</p>
            </div>
            <div style={styles.resultCard}>
              <h3 style={styles.label}>Personality</h3>
              <p style={styles.value}>{result.personality}</p>
            </div>
            <div style={styles.resultCard}>
              <h3 style={styles.label}>Hook Style</h3>
              <p style={styles.value}>{result.hookStyle}</p>
            </div>
          </div>

          <div style={styles.resultCard}>
            <h3 style={styles.label}>Vocabulary</h3>
            <div style={styles.vocabRow}>
              <div>
                <p style={styles.vocabLabel}>✅ Uses</p>
                {result.vocabulary.uses.map((w, i) => (
                  <span key={i} style={styles.tag}>{w}</span>
                ))}
              </div>
              <div>
                <p style={styles.vocabLabel}>❌ Avoids</p>
                {result.vocabulary.avoids.map((w, i) => (
                  <span key={i} style={{ ...styles.tag, background: "#fee2e2", color: "#dc2626" }}>{w}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.resultCard}>
            <h3 style={styles.label}>Sample Caption</h3>
            <p style={styles.value}>{result.sampleCaption}</p>
          </div>

          <div style={styles.resultCard}>
            <h3 style={styles.label}>Video Content Ideas</h3>
            {result.videoContentIdeas.map((idea, i) => (
              <p key={i} style={styles.idea}>→ {idea}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f0f0f",
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    padding: "40px 20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #a855f7, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#888",
    fontSize: "1rem",
  },
  card: {
    background: "#1a1a1a",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "32px",
    border: "1px solid #2a2a2a",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
    fontSize: "1rem",
    marginBottom: "12px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
    fontSize: "0.95rem",
    marginBottom: "16px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #a855f7, #ec4899)",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  buttonDisabled: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    background: "#333",
    color: "#666",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "not-allowed",
  },
  error: {
    color: "#f87171",
    fontSize: "0.9rem",
    marginBottom: "12px",
  },
  resultContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  resultTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    marginBottom: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  resultCard: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "12px",
    padding: "20px",
  },
  label: {
    fontSize: "0.8rem",
    color: "#a855f7",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "8px",
  },
  value: {
    fontSize: "0.95rem",
    color: "#e5e5e5",
    lineHeight: "1.6",
  },
  vocabRow: {
    display: "flex",
    gap: "32px",
    flexWrap: "wrap",
  },
  vocabLabel: {
    fontSize: "0.85rem",
    color: "#888",
    marginBottom: "8px",
  },
  tag: {
    display: "inline-block",
    background: "#d1fae5",
    color: "#065f46",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    marginRight: "6px",
    marginBottom: "6px",
  },
  idea: {
    color: "#e5e5e5",
    fontSize: "0.95rem",
    marginBottom: "6px",
  },
};