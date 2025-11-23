import React, { useState, useEffect, useRef } from "react";

interface VoiceToTextProps {
  onTextGenerated: (text: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export const VoiceToText: React.FC<VoiceToTextProps> = ({
  onTextGenerated,
  isActive,
  onToggle,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
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
          onTextGenerated(final);
          setInterimText("");
        } else {
          setInterimText(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
          // Restart if no speech detected
          recognition.stop();
          setTimeout(() => {
            if (isListening) recognition.start();
          }, 100);
        } else {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isListening) {
          // Restart recognition if it ended but we're still listening
          try {
            recognition.start();
          } catch (e) {
            console.log("Recognition restart failed:", e);
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, onTextGenerated]);

  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimText("");
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition:", e);
      }
    }
  };

  if (!isActive) return null;

  if (!isSupported) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          right: "20px",
          padding: "16px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
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
        <button
          onClick={onToggle}
          style={{
            marginTop: "12px",
            padding: "8px 16px",
            backgroundColor: "#e9ecef",
            border: "none",
            borderRadius: "6px",
            fontSize: "13px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Close
        </button>
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
        backgroundColor: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
        zIndex: 1100,
        minWidth: "300px",
        maxWidth: "400px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
        <button
          onClick={onToggle}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#95a5a6",
            padding: "0 4px",
          }}
        >
          ×
        </button>
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
          color: isListening ? "#dc3545" : "#6c757d",
          marginBottom: "12px",
        }}
      >
        {isListening ? "🔴 Listening..." : "Click to start dictating"}
      </div>

      {/* Interim Text */}
      {interimText && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#6c757d",
            fontStyle: "italic",
            marginBottom: "12px",
            minHeight: "60px",
            border: "2px dashed #dee2e6",
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
        <strong>Tips:</strong>
        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li>Speak clearly and at a normal pace</li>
          <li>Say "period" for punctuation</li>
          <li>Say "new paragraph" to start fresh</li>
          <li>Works best in quiet environments</li>
        </ul>
      </div>
    </div>
  );
};
