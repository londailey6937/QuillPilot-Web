import React, { useState, useEffect, useRef } from "react";
import { supabase, getCurrentUser, getUserProfile } from "@/utils/supabase";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/utils/supabase";

interface UserMenuProps {
  onAuthRequired: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onAuthRequired }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const checkUser = async () => {
    setLoading(true);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      await loadProfile();
    }
    setLoading(false);
  };

  const loadProfile = async () => {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={onAuthRequired}
        style={{
          padding: "8px 16px",
          backgroundColor: "#ffffff",
          color: "#2c3e50",
          border: "2px solid #ef8432",
          borderRadius: "20px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#f7e6d0")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#ffffff")
        }
      >
        Sign In
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "4px 12px 4px 4px",
          backgroundColor: "#ffffff",
          border: "2px solid #ef8432",
          borderRadius: "24px",
          cursor: "pointer",
          transition: "all 0.2s",
          color: "#2c3e50",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#f7e6d0")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#ffffff")
        }
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "#2c3e50",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          {profile?.full_name?.[0]?.toUpperCase() ||
            user.email?.[0]?.toUpperCase() ||
            "U"}
        </div>
        <span
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#2c3e50",
          }}
        >
          {profile?.full_name || user.email}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            marginTop: "8px",
            width: "260px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            border: "2px solid #ef8432",
            padding: "0",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #ef8432",
              backgroundColor: "#f7e6d0",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "600",
                color: "#2c3e50",
              }}
            >
              {profile?.full_name || "User"}
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "12px",
                color: "#4b5563",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.email}
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "12px",
                color: "#ef8432",
                fontWeight: "700",
                textTransform: "capitalize",
              }}
            >
              {profile?.access_level || "free"} plan
            </p>
          </div>

          <div style={{ padding: "8px 0" }}>
            <button
              onClick={handleSignOut}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 16px",
                fontSize: "14px",
                color: "#2c3e50",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f7e6d0";
                e.currentTarget.style.color = "#ef8432";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#2c3e50";
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
