import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";

const ScoreModal = ({
  isOpen,
  onClose,
  onSave,
  student,
  assessment,
  currentScore,
}) => {
  const [score, setScore] = useState("");

  useEffect(() => {
    setScore(currentScore ?? ""); // Reset score when modal opens
  }, [isOpen, currentScore]);

  const handleSave = () => {
    const numScore = parseInt(score);
    if (!isNaN(numScore) && numScore >= 0 && numScore <= assessment.maxScore) {
      onSave(student.id, assessment.name, numScore);
      onClose();
    } else {
      alert(`Please enter a score between 0 and ${assessment.maxScore}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Score</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Student:</span> {student.name}
            </p>
            <p>
              <span className="font-medium">Assessment:</span> {assessment.name}
            </p>
            <p>
              <span className="font-medium">Max Score:</span>{" "}
              {assessment.maxScore}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Score
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter score (0-${assessment.maxScore})`}
              min="0"
              max={assessment.maxScore}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={score === ""}
          >
            <Save size={16} className="inline mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreModal;
