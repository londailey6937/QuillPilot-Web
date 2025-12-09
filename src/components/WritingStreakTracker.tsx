import React, { useEffect, useState } from "react";

interface WritingSession {
  date: string;
  wordCount: number;
  minutes: number;
}

interface WritingStreakTrackerProps {
  currentWordCount: number;
  onClose?: () => void;
}

export const WritingStreakTracker: React.FC<WritingStreakTrackerProps> = ({
  currentWordCount,
  onClose,
}) => {
  const [sessions, setSessions] = useState<WritingSession[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    // Load sessions from localStorage
    const stored = localStorage.getItem("quillpilot_writing_sessions");
    if (stored) {
      const parsedSessions: WritingSession[] = JSON.parse(stored);
      setSessions(parsedSessions);
      calculateStats(parsedSessions);
    }
  }, []);

  const calculateStats = (sessionList: WritingSession[]) => {
    // Calculate total words and minutes
    const totalW = sessionList.reduce((sum, s) => sum + s.wordCount, 0);
    const totalM = sessionList.reduce((sum, s) => sum + s.minutes, 0);
    setTotalWords(totalW);
    setTotalMinutes(totalM);

    // Calculate streaks
    if (sessionList.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    const sortedSessions = [...sessionList].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let maxStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check current streak
    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].date);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else if (daysDiff > streak) {
        break;
      }
    }

    setCurrentStreak(streak);

    // Calculate longest streak ever
    let tempStreak = 1;
    for (let i = 1; i < sortedSessions.length; i++) {
      const prevDate = new Date(sortedSessions[i - 1].date);
      const currDate = new Date(sortedSessions[i].date);
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    setLongestStreak(maxStreak);
  };

  const saveTodaySession = () => {
    const today = new Date().toISOString().split("T")[0];
    const existingIndex = sessions.findIndex((s) => s.date === today);

    let updatedSessions: WritingSession[];
    if (existingIndex >= 0) {
      // Update existing session
      updatedSessions = [...sessions];
      updatedSessions[existingIndex].wordCount += currentWordCount;
      updatedSessions[existingIndex].minutes += 15; // Estimate
    } else {
      // Add new session
      updatedSessions = [
        ...sessions,
        { date: today, wordCount: currentWordCount, minutes: 15 },
      ];
    }

    setSessions(updatedSessions);
    localStorage.setItem(
      "quillpilot_writing_sessions",
      JSON.stringify(updatedSessions)
    );
    calculateStats(updatedSessions);
  };

  // Get last 7 days for calendar view
  const getLast7Days = (): Array<{
    date: string;
    day: string;
    hasActivity: boolean;
    wordCount: number;
  }> => {
    const days: Array<{
      date: string;
      day: string;
      hasActivity: boolean;
      wordCount: number;
    }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const session = sessions.find((s) => s.date === dateStr);
      days.push({
        date: dateStr,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        hasActivity: !!session,
        wordCount: session?.wordCount || 0,
      });
    }
    return days;
  };

  const last7Days = getLast7Days();
  const avgWordsPerDay =
    sessions.length > 0 ? Math.round(totalWords / sessions.length) : 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-xl w-full mx-4 overflow-hidden"
        style={{
          border: "2px solid #e0c392",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-gradient-to-r from-[#fef5e7] to-[#fff7ed] border-b border-[#e0c392]">
          <h2 className="text-xl font-bold text-[#2c3e50] flex items-center gap-2">
            <span>🔥</span> Writing Streak
          </h2>
        </div>
        <div className="p-6">
          {/* Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                padding: "20px",
                backgroundColor: "#fef5e7",
                borderRadius: "12px",
                border: "2px solid #e0c392",
              }}
            >
              <div
                style={{ fontSize: "32px", fontWeight: 700, color: "#ef8432" }}
              >
                {currentStreak}
              </div>
              <div
                style={{ fontSize: "14px", color: "#2c3e50", marginTop: "4px" }}
              >
                Current Streak
              </div>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#fef5e7",
                borderRadius: "12px",
                border: "2px solid #e0c392",
              }}
            >
              <div
                style={{ fontSize: "32px", fontWeight: 700, color: "#ef8432" }}
              >
                {longestStreak}
              </div>
              <div
                style={{ fontSize: "14px", color: "#2c3e50", marginTop: "4px" }}
              >
                Longest Streak
              </div>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#fef5e7",
                borderRadius: "12px",
                border: "2px solid #e0c392",
              }}
            >
              <div
                style={{ fontSize: "32px", fontWeight: 700, color: "#10b981" }}
              >
                {totalWords.toLocaleString()}
              </div>
              <div
                style={{ fontSize: "14px", color: "#2c3e50", marginTop: "4px" }}
              >
                Total Words
              </div>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#fef5e7",
                borderRadius: "12px",
                border: "2px solid #e0c392",
              }}
            >
              <div
                style={{ fontSize: "32px", fontWeight: 700, color: "#2c3e50" }}
              >
                {avgWordsPerDay.toLocaleString()}
              </div>
              <div
                style={{ fontSize: "14px", color: "#2c3e50", marginTop: "4px" }}
              >
                Avg Words/Day
              </div>
            </div>
          </div>

          {/* Last 7 Days Calendar */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#2c3e50",
                marginBottom: "12px",
              }}
            >
              Last 7 Days
            </h3>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "space-between",
              }}
            >
              {last7Days.map((day) => (
                <div
                  key={day.date}
                  style={{
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      marginBottom: "4px",
                    }}
                  >
                    {day.day}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "60px",
                      backgroundColor: day.hasActivity ? "#10b981" : "#f7e6d0",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: day.hasActivity ? "#fff" : "#9ca3af",
                      border: day.hasActivity ? "none" : "1px solid #e0c392",
                    }}
                    title={`${day.wordCount} words`}
                  >
                    {day.hasActivity ? "✓" : "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Today Button */}
          <button
            onClick={saveTodaySession}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#059669";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#10b981";
            }}
          >
            Record Today's Session ({currentWordCount} words)
          </button>

          {/* Motivational Message */}
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              backgroundColor: "#f7e6d0",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#2c3e50",
              textAlign: "center",
              fontStyle: "italic",
              border: "1px solid #e0c392",
            }}
          >
            {currentStreak === 0 &&
              "Start your streak today! Every word counts."}
            {currentStreak > 0 &&
              currentStreak < 3 &&
              "Great start! Keep it going!"}
            {currentStreak >= 3 &&
              currentStreak < 7 &&
              "You're on fire! 🔥 Building momentum!"}
            {currentStreak >= 7 &&
              currentStreak < 30 &&
              "Amazing streak! You're a writing machine!"}
            {currentStreak >= 30 && "Legendary! You're unstoppable! 🚀"}
          </div>
        </div>
      </div>
    </div>
  );
};
