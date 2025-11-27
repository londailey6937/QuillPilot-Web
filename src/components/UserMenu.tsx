import React, { useState, useEffect, useRef } from "react";
import {
  supabase,
  getCurrentUser,
  getUserProfile,
  signOut,
  isSupabaseConfigured,
} from "@/utils/supabase";
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
    let mounted = true;

    const initAuth = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        // Set a safety timeout
        const timeoutId = setTimeout(() => {
          if (mounted) {
            setLoading(false);
          }
        }, 4000);

        const currentUser = await getCurrentUser();

        clearTimeout(timeoutId);

        if (!mounted) return;

        setUser(currentUser);
        if (currentUser) {
          const userProfile = await getUserProfile();
          if (mounted) {
            setProfile(userProfile);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("UserMenu: Error initializing auth:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
      if (session?.user) {
        getUserProfile().then((userProfile) => {
          if (mounted) {
            setProfile(userProfile);
          }
        });
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setProfile(null);
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">Loading...</div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={onAuthRequired}
        style={{
          padding: "6px 12px",
          backgroundColor: "white",
          color: "#2c3e50",
          border: "1.5px solid #e0c392",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f7e6d0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "white";
        }}
      >
        🔐 Sign In
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.25rem 0.75rem 0.25rem 0.25rem",
          backgroundColor: "white",
          border: "2px solid #ef8432",
          borderRadius: "9999px",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f7e6d0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "white";
        }}
      >
        <img src="/favicon.svg" alt="User" className="w-8 h-8 rounded-full" />
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: "600",
            color: "#2c3e50",
            maxWidth: "120px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {profile?.full_name || user.email?.split("@")[0]}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border-2 border-[#ef8432] overflow-hidden z-50">
          <div className="p-4 bg-[#f7e6d0] border-b border-[#ef8432]">
            <p className="font-semibold text-[#2c3e50] text-sm">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-gray-600 truncate mt-1">{user.email}</p>
            {profile?.access_level && profile.access_level !== "free" && (
              <div className="mt-2 inline-block px-2 py-1 bg-[#ef8432] text-white text-xs font-bold rounded uppercase">
                {profile.access_level}
              </div>
            )}
          </div>

          <div className="py-2">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2.5 text-sm text-[#2c3e50] hover:bg-[#f7e6d0] hover:text-[#ef8432] font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
