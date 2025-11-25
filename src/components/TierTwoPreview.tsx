/**
 * Tier Two Preview - Simple upgrade confirmation
 */

import React from "react";

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
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative border-2 border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 text-2xl w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          ×
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full mb-4 shadow-lg">
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
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Continue to Sign In
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-2 text-gray-500 hover:text-gray-700 font-medium text-sm"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
