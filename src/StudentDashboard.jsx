import { useState, useContext } from "react";
import { calculateFinalGrade } from "./utils/calculateFinalGrade";
import { AppContext } from "./App";

const StudentDashboard = ({ user, onLogout }) => {
  const { data } = useContext(AppContext);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const currentStudent = data.students.find((s) => s.name === user.name);

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (passwordForm.oldPassword !== user.password) {
      alert("Old password is incorrect!");
      return;
    }
    alert("Password changed successfully!");
    setShowChangePassword(false);
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (!currentStudent) {
    return <div className="p-8 text-center">Student data not found.</div>;
  }

  if (showChangePassword) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Change Password
              </h1>
              <button
                onClick={() => setShowChangePassword(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-2xl p-6">
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Old Password
                </label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Student Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.name}
              </span>
              <button
                onClick={() => setShowChangePassword(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grades Table */}
        <div className="bg-white shadow rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            My Grades
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Assessment
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Score
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Max Score
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Percentage
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Weight
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.assessments.map((assessment) => {
                  const score = currentStudent.scores[assessment.name];
                  const percentage =
                    score !== undefined
                      ? ((score / assessment.maxScore) * 100).toFixed(1)
                      : "-";

                  return (
                    <tr key={assessment.name} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {assessment.name}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {score !== undefined ? score : "-"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {assessment.maxScore}
                      </td>
                      <td className="px-4 py-4 text-center">{percentage}%</td>
                      <td className="px-4 py-4 text-center">
                        {assessment.weight}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Final Grade:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {calculateFinalGrade(currentStudent, data.assessments).toFixed(
                  1
                )}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {currentStudent.comment && (
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Instructor Comments
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
              {currentStudent.comment}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
