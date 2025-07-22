import React from "react";

const SystemUpdate = () => (
  <div className="bg-red-100 border-l-4 border-red-400 rounded-lg p-4">
    <h3 className="font-bold text-yellow-800 mb-4">🛠️ System Update Tasks</h3>

    <div className="space-y-3 text-sm text-gray-800">
      {/* Fix */}
      <details className="group">
        <summary className="cursor-pointer font-semibold text-yellow-700 hover:text-yellow-800 transition">
          🔧 Fix ({["Fix potential grade", "Fix profile layout"].length})
        </summary>
        <div className="mt-2 ml-4 list-disc list-inside space-y-1">
          <li>Fix potential grade miscalculation</li>
          <li>Fix profile modal layout</li>
        </div>
      </details>

      {/* Add */}
      <details className="group">
        <summary className="cursor-pointer font-semibold text-yellow-700 hover:text-yellow-800 transition">
          ➕ Add (
          {
            [
              "Working navigation links",
              "Footer",
              "Activity history",
              "Session logs",
              "Reporting tools",
            ].length
          }
          )
        </summary>
        <div className="mt-2 ml-4 list-disc list-inside space-y-1">
          <li>Add working navigation links</li>
          <li>Add footer (if necessary)</li>
          <li>Add activity history tracker</li>
          <li>Add session logs</li>
          <li>Add reporting and analytics</li>
        </div>
      </details>

      {/* Modify */}
      <details className="group">
        <summary className="cursor-pointer font-semibold text-yellow-700 hover:text-yellow-800 transition">
          ✏️ Modify (
          {["Class selection", "Enroll class", "Assessment flow"].length})
        </summary>
        <div className="mt-2 ml-4 list-disc list-inside space-y-1">
          <li>Enhance class selection UI</li>
          <li>Improve enroll class workflow</li>
          <li>Refine assessment feature UX</li>
        </div>
      </details>

      {/* Other Suggestions */}
      <details className="group">
        <summary className="cursor-pointer font-semibold text-yellow-700 hover:text-yellow-800 transition">
          💡 Others ({["Organize records", "Export/import", "Audit log"].length}
          )
        </summary>
        <div className="mt-2 ml-4 list-disc list-inside space-y-1">
          <li>Organize records by class and term</li>
          <li>Export/import options for reports</li>
          <li>Implement audit log for admin actions</li>
        </div>
      </details>
    </div>
  </div>
);

export default SystemUpdate;
