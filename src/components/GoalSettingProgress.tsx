import React, { useEffect, useState } from "react";

interface Goal {
  id: string;
  type: "daily" | "weekly" | "project";
  targetWords: number;
  currentWords: number;
  startDate: string;
  endDate?: string;
  title?: string;
}

interface GoalSettingProgressProps {
  currentWordCount: number;
  totalProjectWords?: number;
  onClose?: () => void;
}

export const GoalSettingProgress: React.FC<GoalSettingProgressProps> = ({
  currentWordCount,
  totalProjectWords = 0,
  onClose,
}) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoalType, setNewGoalType] = useState<
    "daily" | "weekly" | "project"
  >("daily");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalTitle, setNewGoalTitle] = useState("");

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const stored = localStorage.getItem("quillpilot_goals");
    if (stored) {
      setGoals(JSON.parse(stored));
    }
  };

  const saveGoals = (updatedGoals: Goal[]) => {
    localStorage.setItem("quillpilot_goals", JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
  };

  const createGoal = () => {
    if (!newGoalTarget || parseInt(newGoalTarget) <= 0) return;

    const today = new Date().toISOString().split("T")[0];
    let endDate = today;

    if (newGoalType === "weekly") {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() + 7);
      endDate = weekEnd.toISOString().split("T")[0];
    } else if (newGoalType === "project") {
      const projectEnd = new Date();
      projectEnd.setMonth(projectEnd.getMonth() + 3);
      endDate = projectEnd.toISOString().split("T")[0];
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      type: newGoalType,
      targetWords: parseInt(newGoalTarget),
      currentWords: 0,
      startDate: today,
      endDate,
      title: newGoalTitle || `${newGoalType} goal`,
    };

    saveGoals([...goals, newGoal]);
    setShowNewGoal(false);
    setNewGoalTarget("");
    setNewGoalTitle("");
  };

  const updateGoalProgress = (goalId: string, wordsToAdd: number) => {
    const updated = goals.map((g) =>
      g.id === goalId ? { ...g, currentWords: g.currentWords + wordsToAdd } : g
    );
    saveGoals(updated);
  };

  const deleteGoal = (goalId: string) => {
    saveGoals(goals.filter((g) => g.id !== goalId));
  };

  const getProgress = (goal: Goal) => {
    return Math.min(100, (goal.currentWords / goal.targetWords) * 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEstimatedCompletion = (goal: Goal) => {
    if (goal.currentWords === 0) return "N/A";

    const daysElapsed =
      (new Date().getTime() - new Date(goal.startDate).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysElapsed === 0) return "N/A";

    const avgWordsPerDay = goal.currentWords / daysElapsed;
    const remainingWords = goal.targetWords - goal.currentWords;
    const daysToComplete = Math.ceil(remainingWords / avgWordsPerDay);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToComplete);

    return completionDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "700px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#2c3e50",
              margin: 0,
            }}
          >
            🎯 Goals & Progress
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#95a5a6",
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Goals List */}
        {goals.length === 0 && !showNewGoal && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#6c757d",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
            <p>No goals set yet. Create your first writing goal!</p>
          </div>
        )}

        {goals.map((goal) => {
          const progress = getProgress(goal);
          const daysRemaining = goal.endDate
            ? getDaysRemaining(goal.endDate)
            : null;

          return (
            <div
              key={goal.id}
              style={{
                marginBottom: "16px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                border: "2px solid #e9ecef",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: "#fff",
                        backgroundColor:
                          goal.type === "daily"
                            ? "#10b981"
                            : goal.type === "weekly"
                            ? "#3b82f6"
                            : "#8b5cf6",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {goal.type}
                    </span>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#2c3e50",
                      }}
                    >
                      {goal.title}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#6c757d" }}>
                    {goal.currentWords.toLocaleString()} /{" "}
                    {goal.targetWords.toLocaleString()} words
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc3545",
                    cursor: "pointer",
                    fontSize: "20px",
                    padding: "0 8px",
                  }}
                  title="Delete goal"
                >
                  ×
                </button>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: "12px",
                  backgroundColor: "#dee2e6",
                  borderRadius: "6px",
                  overflow: "hidden",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    backgroundColor:
                      progress >= 100
                        ? "#10b981"
                        : progress >= 75
                        ? "#3b82f6"
                        : progress >= 50
                        ? "#f59e0b"
                        : "#ef4444",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  color: "#6c757d",
                }}
              >
                <span>{Math.round(progress)}% complete</span>
                {daysRemaining !== null && (
                  <span>
                    {daysRemaining > 0
                      ? `${daysRemaining} days remaining`
                      : daysRemaining === 0
                      ? "Last day!"
                      : "Overdue"}
                  </span>
                )}
              </div>

              {/* Estimated Completion */}
              {goal.type !== "daily" && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#495057",
                    fontStyle: "italic",
                  }}
                >
                  Est. completion: {getEstimatedCompletion(goal)}
                </div>
              )}

              {/* Add Words Button */}
              <button
                onClick={() => updateGoalProgress(goal.id, currentWordCount)}
                disabled={currentWordCount === 0}
                style={{
                  marginTop: "12px",
                  padding: "8px 16px",
                  backgroundColor: currentWordCount > 0 ? "#10b981" : "#e9ecef",
                  color: currentWordCount > 0 ? "#fff" : "#adb5bd",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: currentWordCount > 0 ? "pointer" : "not-allowed",
                  width: "100%",
                }}
              >
                Add {currentWordCount} words to this goal
              </button>
            </div>
          );
        })}

        {/* New Goal Form */}
        {showNewGoal && (
          <div
            style={{
              marginTop: "16px",
              padding: "20px",
              backgroundColor: "#e7f5ff",
              borderRadius: "12px",
              border: "2px solid #339af0",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#2c3e50",
                marginBottom: "16px",
              }}
            >
              Create New Goal
            </h3>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#2c3e50",
                  marginBottom: "4px",
                }}
              >
                Goal Type
              </label>
              <select
                value={newGoalType}
                onChange={(e) => setNewGoalType(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="project">Project (3 months)</option>
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#2c3e50",
                  marginBottom: "4px",
                }}
              >
                Goal Title (optional)
              </label>
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="e.g., Chapter 5 completion"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#2c3e50",
                  marginBottom: "4px",
                }}
              >
                Target Word Count
              </label>
              <input
                type="number"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                placeholder="e.g., 1000"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={createGoal}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Create Goal
              </button>
              <button
                onClick={() => setShowNewGoal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#e9ecef",
                  color: "#495057",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Goal Button */}
        {!showNewGoal && (
          <button
            onClick={() => setShowNewGoal(true)}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>+</span>
            <span>Create New Goal</span>
          </button>
        )}
      </div>
    </div>
  );
};
