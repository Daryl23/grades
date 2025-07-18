import React, { useState, useContext, createContext } from 'react';
import { Eye, EyeOff, Edit, Trash2, Plus, Save, X } from 'lucide-react';

// Context for authentication and data
const AppContext = createContext();

// Sample data
const initialData = {
  users: [
    { id: 'i001', name: 'Prof. Smith', role: 'instructor', password: 'instructor123' },
    { id: 's001', name: 'Juan Dela Cruz', role: 'student', password: 'student123' },
    { id: 's002', name: 'Maria Santos', role: 'student', password: 'student123' },
    { id: 's003', name: 'Pedro Garcia', role: 'student', password: 'student123' }
  ],
  assessments: [
    { name: 'Quiz 1', maxScore: 20, weight: 10 },
    { name: 'Midterm', maxScore: 50, weight: 30 },
    { name: 'Final', maxScore: 100, weight: 60 }
  ],
  students: [
    {
      id: 's001',
      name: 'Juan Dela Cruz',
      scores: { 'Quiz 1': 18, 'Midterm': 45, 'Final': 85 },
      comment: 'Good progress, keep it up.',
      finalGrade: 0
    },
    {
      id: 's002',
      name: 'Maria Santos',
      scores: { 'Quiz 1': 20, 'Midterm': 48, 'Final': 92 },
      comment: 'Excellent performance!',
      finalGrade: 0
    },
    {
      id: 's003',
      name: 'Pedro Garcia',
      scores: { 'Quiz 1': 15, 'Midterm': 42, 'Final': 78 },
      comment: 'Needs improvement in final exam preparation.',
      finalGrade: 0
    }
  ]
};

// Login Component
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const user = initialData.users.find(u => u.name === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Grading System</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600">
            <p className="mb-2">Demo Accounts:</p>
            <div className="bg-gray-50 p-3 rounded-lg text-left">
              <p><strong>Instructor:</strong> Prof. Smith / instructor123</p>
              <p><strong>Student:</strong> Juan Dela Cruz / student123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Assessment Form Modal
const AssessmentModal = ({ isOpen, onClose, onSave, assessment = null }) => {
  const [formData, setFormData] = useState({
    name: assessment?.name || '',
    maxScore: assessment?.maxScore || '',
    weight: assessment?.weight || ''
  });

  const handleSave = () => {
    if (formData.name && formData.maxScore && formData.weight) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {assessment ? 'Edit Assessment' : 'Add Assessment'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Quiz 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
            <input
              type="number"
              value={formData.maxScore}
              onChange={(e) => setFormData({...formData, maxScore: parseInt(e.target.value) || ''})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value) || ''})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 30"
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save size={16} className="inline mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Score Edit Modal
const ScoreModal = ({ isOpen, onClose, onSave, student, assessment, currentScore }) => {
  const [score, setScore] = useState(currentScore || '');

  const handleSave = () => {
    const numScore = parseInt(score);
    if (!isNaN(numScore) && numScore >= 0 && numScore <= assessment.maxScore) {
      onSave(student.id, assessment.name, numScore);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Score</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Student: <span className="font-medium">{student.name}</span></p>
            <p className="text-sm text-gray-600">Assessment: <span className="font-medium">{assessment.name}</span></p>
            <p className="text-sm text-gray-600">Max Score: <span className="font-medium">{assessment.maxScore}</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save size={16} className="inline mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Instructor Dashboard
const InstructorDashboard = ({ user, onLogout }) => {
  const { data, setData } = useContext(AppContext);
  const [assessmentModal, setAssessmentModal] = useState({ isOpen: false, assessment: null });
  const [scoreModal, setScoreModal] = useState({ isOpen: false, student: null, assessment: null, currentScore: '' });
  const [editingComment, setEditingComment] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Calculate Final Grade for a student
  const calculateFinalGrade = (student) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    data.assessments.forEach(assessment => {
      const score = student.scores[assessment.name];
      if (score !== undefined) {
        const percentage = (score / assessment.maxScore) * 100;
        totalWeightedScore += percentage * (assessment.weight / 100);
        totalWeight += assessment.weight;
      }
    });

    return totalWeight > 0 ? totalWeightedScore : 0;
  };

  const handleAddAssessment = (assessmentData) => {
    setData(prev => ({
      ...prev,
      assessments: [...prev.assessments, assessmentData]
    }));
  };

  const handleEditAssessment = (assessmentData) => {
    setData(prev => ({
      ...prev,
      assessments: prev.assessments.map(a => 
        a.name === assessmentModal.assessment.name ? assessmentData : a
      )
    }));
  };

  const handleDeleteAssessment = (assessmentName) => {
    setData(prev => ({
      ...prev,
      assessments: prev.assessments.filter(a => a.name !== assessmentName),
      students: prev.students.map(s => ({
        ...s,
        scores: Object.fromEntries(
          Object.entries(s.scores).filter(([key]) => key !== assessmentName)
        )
      }))
    }));
  };

  const handleScoreSave = (studentId, assessmentName, score) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s => 
        s.id === studentId 
          ? { ...s, scores: { ...s.scores, [assessmentName]: score } }
          : s
      )
    }));
  };

  const handleCommentSave = (studentId, comment) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s => 
        s.id === studentId ? { ...s, comment } : s
      )
    }));
    setEditingComment(null);
  };

  const startEditComment = (student) => {
    setEditingComment(student.id);
    setCommentText(student.comment || '');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assessment Management */}
        <div className="bg-white shadow rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Assessment Tasks</h2>
            <button
              onClick={() => setAssessmentModal({ isOpen: true, assessment: null })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="inline mr-2" />
              Add Assessment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.assessments.map((assessment) => (
              <div key={assessment.name} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{assessment.name}</h3>
                <p className="text-sm text-gray-600">Max Score: {assessment.maxScore}</p>
                <p className="text-sm text-gray-600">Weight: {assessment.weight}%</p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => setAssessmentModal({ isOpen: true, assessment })}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteAssessment(assessment.name)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Grades Table */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Grades</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student</th>
                  {data.assessments.map(assessment => (
                    <th key={assessment.name} className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      {assessment.name}
                      <div className="text-xs text-gray-500">/{assessment.maxScore}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Final Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900">{student.name}</td>
                    {data.assessments.map(assessment => (
                      <td key={assessment.name} className="px-4 py-4 text-center">
                        <button
                          onClick={() => setScoreModal({
                            isOpen: true,
                            student,
                            assessment,
                            currentScore: student.scores[assessment.name] || ''
                          })}
                          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                          {student.scores[assessment.name] || '-'}
                        </button>
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center font-medium">
                      {calculateFinalGrade(student).toFixed(1)}%
                    </td>
                    <td className="px-4 py-4">
                      {editingComment === student.id ? (
                        <div className="flex space-x-2">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                            rows="2"
                          />
                          <button
                            onClick={() => handleCommentSave(student.id, commentText)}
                            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => setEditingComment(null)}
                            className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditComment(student)}
                          className="text-left text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          {student.comment || 'Click to add comment...'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssessmentModal
        isOpen={assessmentModal.isOpen}
        onClose={() => setAssessmentModal({ isOpen: false, assessment: null })}
        onSave={assessmentModal.assessment ? handleEditAssessment : handleAddAssessment}
        assessment={assessmentModal.assessment}
      />

      <ScoreModal
        isOpen={scoreModal.isOpen}
        onClose={() => setScoreModal({ isOpen: false, student: null, assessment: null, currentScore: '' })}
        onSave={handleScoreSave}
        student={scoreModal.student}
        assessment={scoreModal.assessment}
        currentScore={scoreModal.currentScore}
      />
    </div>
  );
};

// Student Dashboard
const StudentDashboard = ({ user, onLogout }) => {
  const { data } = useContext(AppContext);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const currentStudent = data.students.find(s => s.name === user.name);

  // Calculate final grade
  const calculateFinalGrade = (student) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    data.assessments.forEach(assessment => {
      const score = student.scores[assessment.name];
      if (score !== undefined) {
        const percentage = (score / assessment.maxScore) * 100;
        totalWeightedScore += percentage * (assessment.weight / 100);
        totalWeight += assessment.weight;
      }
    });

    return totalWeight > 0 ? totalWeightedScore : 0;
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordForm.oldPassword !== user.password) {
      alert('Old password is incorrect!');
      return;
    }
    alert('Password changed successfully!');
    setShowChangePassword(false);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
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
              <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
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
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">My Grades</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Assessment</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Score</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Max Score</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Percentage</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.assessments.map((assessment) => {
                  const score = currentStudent.scores[assessment.name];
                  const percentage = score !== undefined ? ((score / assessment.maxScore) * 100).toFixed(1) : '-';
                  
                  return (
                    <tr key={assessment.name} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{assessment.name}</td>
                      <td className="px-4 py-4 text-center">{score !== undefined ? score : '-'}</td>
                      <td className="px-4 py-4 text-center">{assessment.maxScore}</td>
                      <td className="px-4 py-4 text-center">{percentage}%</td>
                      <td className="px-4 py-4 text-center">{assessment.weight}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Final Grade:</span>
              <span className="text-2xl font-bold text-blue-600">
                {calculateFinalGrade(currentStudent).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {currentStudent.comment && (
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructor Comments</h2>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
              {currentStudent.comment}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(initialData);

  const handleLogout = () => setUser(null);

  return (
    <AppContext.Provider value={{ data, setData }}>
      {!user ? (
        <Login onLogin={setUser} />
      ) : user.role === 'instructor' ? (
        <InstructorDashboard user={user} onLogout={handleLogout} />
      ) : (
        <StudentDashboard user={user} onLogout={handleLogout} />
      )}
    </AppContext.Provider>
  );
};

export default App;