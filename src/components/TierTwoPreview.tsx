/**
 * Tier Two Preview - Simple upgrade confirmation
 */

import React from "react";
import { creamPalette as palette } from "../styles/palette";

interface TierTwoPreviewProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export const TierTwoPreview: React.FC<TierTwoPreviewProps> = ({
  onClose,
  onUpgrade,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
        style={{
          background: palette.base,
          border: `2px solid ${palette.border}`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 text-2xl w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          ×
        </button>

        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg"
            style={{
              background: palette.subtle,
              border: `1px solid ${palette.lightBorder}`,
            }}
          >
            <span className="text-3xl">✨</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to Upgrade?
          </h2>
          <p className="text-gray-600 text-base mb-6 leading-relaxed">
            You'll need to sign in or create an account to upgrade your
            subscription and unlock premium features.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onUpgrade}
              className="w-full px-6 py-3 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              style={{ background: palette.accent }}
            >
              Continue to Sign In
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-2 font-medium text-sm"
              style={{ color: palette.mutedText }}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
