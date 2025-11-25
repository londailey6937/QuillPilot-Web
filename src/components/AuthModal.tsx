import React, { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Show configuration message if Supabase is not configured
  if (!isSupabaseConfigured) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "32px",
            borderRadius: "12px",
            maxWidth: "400px",
            textAlign: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ marginBottom: "16px", color: "#2c3e50" }}>
            🎉 Running in Demo Mode
          </h2>
          <p style={{ color: "#666", marginBottom: "24px", lineHeight: "1.6" }}>
            QuillPilot is running in free demo mode. You can use all free-tier
            features without signing up!
            <br />
            <br />
            <strong>To enable saving & premium features:</strong> Configure
            Supabase credentials in your .env file.
          </p>
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        setMessage(
          "Account created! Please check your email to confirm your account."
        );
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage("Login successful!");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setError(null);
    setMessage(null);
  };

  const switchMode = () => {
    resetForm();
    setMode(mode === "login" ? "signup" : "login");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div
          className="flex justify-between items-center p-6"
          style={{
            backgroundColor: "#f7e6d0",
            borderBottom: "2px solid #ef8432",
          }}
        >
          <h2 className="text-2xl font-bold" style={{ color: "#2c3e50" }}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl transition-colors"
            style={{
              color: "#2c3e50",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef8432")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#2c3e50")}
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef8432] focus:border-[#ef8432]"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef8432] focus:border-[#ef8432]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ef8432] focus:border-[#ef8432]"
                minLength={6}
                required
              />
              {mode === "signup" && (
                <p className="text-xs text-gray-500 mt-1">
                  At least 6 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "8px 16px",
                backgroundColor: loading ? "#e2e8f0" : "#fef5e7",
                color: loading ? "#64748b" : "#2c3e50",
                border: loading ? "none" : "2px solid #ef8432",
                borderRadius: "20px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#f7e6d0";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#fef5e7";
              }}
            >
              {loading
                ? "Processing..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={switchMode}
              style={{
                color: "#ef8432",
                textDecoration: "underline",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                padding: "4px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#2c3e50")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#ef8432")}
            >
              {mode === "login"
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By signing {mode === "login" ? "in" : "up"}, you agree to save
              your analysis data securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
