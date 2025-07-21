import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";

const AssessmentModal = ({ isOpen, onClose, onSave, assessment = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    maxScore: "",
    weight: "",
    classCode: "",
  });

  // Populate form if editing
  useEffect(() => {
    if (assessment) {
      setFormData({
        name: assessment.name || "",
        maxScore: assessment.maxScore?.toString() || "",
        weight: assessment.weight?.toString() || "",
        classCode: assessment.classCode || "",
      });
    }
  }, [assessment]);

  const handleInputChange = (field, value) => {
    if (field === "maxScore" || field === "weight") {
      if (/^\d*$/.test(value)) {
        setFormData({ ...formData, [field]: value });
      }
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = () => {
    const { name, maxScore, weight, classCode } = formData;
    if (name && maxScore && weight && classCode) {
      onSave({
        name: name.trim(),
        maxScore: parseInt(maxScore),
        weight: parseInt(weight),
        classCode: classCode.trim(),
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {assessment ? "Edit Assessment" : "Add Assessment"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Quiz 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Score
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.maxScore}
              onChange={(e) => handleInputChange("maxScore", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (%)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Code
            </label>
            <input
              type="text"
              value={formData.classCode}
              onChange={(e) => handleInputChange("classCode", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., ABC123"
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
            disabled={!formData.name || !formData.maxScore || !formData.weight || !formData.classCode}
            className={`px-4 py-2 rounded-lg transition-colors text-white ${
              formData.name && formData.maxScore && formData.weight && formData.classCode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Save size={16} className="inline mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;
