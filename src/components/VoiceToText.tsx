import React, { useState, useEffect, useRef, useCallback } from "react";

interface VoiceToTextProps {
  onTextGenerated: (text: string, hasHtml?: boolean) => void;
  isActive: boolean;
  onToggle: () => void;
}

// Process voice commands into punctuation and formatting
const processVoiceText = (text: string): string => {
  let processed = text;

  // Punctuation replacements (case-insensitive)
  const replacements: [RegExp, string][] = [
    // Period/full stop
    [/\bperiod\b/gi, "."],
    [/\bfull stop\b/gi, "."],
    [/\bdot\b/gi, "."],
    // Comma
    [/\bcomma\b/gi, ","],
    // Question mark
    [/\bquestion mark\b/gi, "?"],
    // Exclamation
    [/\bexclamation mark\b/gi, "!"],
    [/\bexclamation point\b/gi, "!"],
    [/\bexclamation\b/gi, "!"],
    // Colon and semicolon
    [/\bcolon\b/gi, ":"],
    [/\bsemicolon\b/gi, ";"],
    [/\bsemi colon\b/gi, ";"],
    // Quotes
    [/\bopen quote\b/gi, '"'],
    [/\bclose quote\b/gi, '"'],
    [/\bend quote\b/gi, '"'],
    [/\bquote\b/gi, '"'],
    // Apostrophe
    [/\bapostrophe\b/gi, "'"],
    // Hyphen/dash
    [/\bhyphen\b/gi, "-"],
    [/\bdash\b/gi, "—"],
    // Parentheses
    [/\bopen paren\b/gi, "("],
    [/\bclose paren\b/gi, ")"],
    [/\bopen parenthesis\b/gi, "("],
    [/\bclose parenthesis\b/gi, ")"],
  ];

  // Handle paragraph/line breaks FIRST
  // Use <br> tags with zero-width space to position cursor
  processed = processed.replace(/\bnew paragraph\b/gi, "<br><br>\u200B");
  processed = processed.replace(/\bparagraph\b/gi, "<br><br>\u200B");
  processed = processed.replace(/\bnew line\b/gi, "<br>\u200B");

  for (const [pattern, replacement] of replacements) {
    processed = processed.replace(pattern, replacement);
  }

  // Clean up extra spaces around punctuation
  processed = processed.replace(/\s+([.,!?;:])/g, "$1");
  processed = processed.replace(/([.,!?;:])\s*/g, "$1 ");

  // Capitalize after sentence-ending punctuation
  processed = processed.replace(
    /([.!?])\s+(\w)/g,
    (_, punct, letter) => punct + " " + letter.toUpperCase()
  );

  return processed.trim() + " ";
};

export const VoiceToText: React.FC<VoiceToTextProps> = ({
  onTextGenerated,
  isActive,
  onToggle,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const onTextGeneratedRef = useRef(onTextGenerated);
  const isListeningRef = useRef(isListening);

  // Keep refs updated
  useEffect(() => {
    onTextGeneratedRef.current = onTextGenerated;
  }, [onTextGenerated]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Initialize speech recognition ONCE
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + " ";
          } else {
            interim += transcript;
          }
        }

        if (final) {
          const processedText = processVoiceText(final);
          // Detect any HTML tags
          const hasHtml = /<[^>]+>/.test(processedText);
          console.log(
            "Voice recognized (final):",
            final,
            "→",
            processedText,
            "hasHtml:",
            hasHtml
          );
          onTextGeneratedRef.current(processedText, hasHtml);
          setInterimText("");
        } else {
          setInterimText(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setError(event.error);
        if (event.error === "not-allowed") {
          setIsListening(false);
          setError(
            "Microphone access denied. Please allow microphone access in your browser settings."
          );
        } else if (event.error === "no-speech") {
          // Just restart silently
          setError(null);
        } else if (event.error === "aborted") {
          // User stopped, do nothing
          setError(null);
        } else {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        console.log("Recognition ended, isListening:", isListeningRef.current);
        if (isListeningRef.current) {
          // Restart recognition if it ended but we're still listening
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log("Recognition restarted");
              } catch (e) {
                console.log("Recognition restart failed:", e);
              }
            }
          }, 100);
        }
      };

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setError(null);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []); // Empty dependency array - only run once

  const toggleListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      console.log("Stopping recognition...");
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Stop failed:", e);
      }
      setIsListening(false);
      setInterimText("");
      setError(null);
    } else {
      console.log("Starting recognition...");
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e: any) {
        console.error("Failed to start recognition:", e);
        setError(e.message || "Failed to start voice recognition");
      }
    }
  }, [isSupported, isListening]);

  if (!isActive) return null;

  if (!isSupported) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          right: "20px",
          padding: "16px",
          background: "linear-gradient(135deg, #fef5e7 0%, #fff7ed 100%)",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          border: "2px solid #e0c392",
          zIndex: 1100,
          maxWidth: "300px",
        }}
      >
        <div
          style={{ fontSize: "14px", color: "#dc3545", marginBottom: "8px" }}
        >
          ⚠️ Voice recognition not supported
        </div>
        <div style={{ fontSize: "12px", color: "#6c757d" }}>
          Try using Chrome, Edge, or Safari for voice dictation support.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        right: "20px",
        padding: "20px",
        background: "linear-gradient(135deg, #fef5e7 0%, #fff7ed 100%)",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
        border: "2px solid #e0c392",
        zIndex: 1100,
        minWidth: "300px",
        maxWidth: "400px",
      }}
    >
      <div
        style={{
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#2c3e50",
            margin: 0,
          }}
        >
          🎤 Voice Dictation
        </h3>
      </div>

      {/* Microphone Button */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <button
          onClick={toggleListening}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            border: `4px solid ${isListening ? "#dc3545" : "#10b981"}`,
            backgroundColor: isListening ? "#dc3545" : "#10b981",
            color: "white",
            fontSize: "32px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            transition: "all 0.3s ease",
            animation: isListening ? "pulse 1.5s infinite" : "none",
          }}
          title={isListening ? "Stop Listening" : "Start Listening"}
        >
          {isListening ? "⏸️" : "🎤"}
        </button>
        <style>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
            }
          }
        `}</style>
      </div>

      {/* Status */}
      <div
        style={{
          textAlign: "center",
          fontSize: "14px",
          fontWeight: 600,
          color: error ? "#dc3545" : isListening ? "#10b981" : "#6c757d",
          marginBottom: "12px",
        }}
      >
        {error
          ? `⚠️ ${error}`
          : isListening
          ? "🟢 Listening..."
          : "Click to start dictating"}
      </div>

      {/* Interim Text */}
      {interimText && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f7e6d0",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#2c3e50",
            fontStyle: "italic",
            marginBottom: "12px",
            minHeight: "60px",
            border: "2px dashed #e0c392",
          }}
        >
          {interimText}
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          fontSize: "12px",
          color: "#6c757d",
          lineHeight: "1.5",
        }}
      >
        <strong>Voice Commands:</strong>
        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li>
            <strong>"period"</strong> → .
          </li>
          <li>
            <strong>"comma"</strong> → ,
          </li>
          <li>
            <strong>"question mark"</strong> → ?
          </li>
          <li>
            <strong>"exclamation"</strong> → !
          </li>
          <li>
            <strong>"new paragraph"</strong> → ¶
          </li>
          <li>
            <strong>"quote" / "end quote"</strong> → "
          </li>
        </ul>
        <div
          style={{
            marginTop: "12px",
            padding: "10px",
            backgroundColor: "#f7e6d0",
            borderRadius: "6px",
            border: "1px solid #e0c392",
          }}
        >
          <strong style={{ color: "#2c3e50" }}>🍎 Mac Users:</strong>
          <div style={{ marginTop: "4px", fontSize: "11px" }}>
            If not working, enable microphone access:
            <br />
            <strong>System Settings → Privacy & Security → Microphone</strong>
            <br />→ Toggle ON for your browser (Chrome/Safari/Edge)
          </div>
        </div>
      </div>
    </div>
  );
};
