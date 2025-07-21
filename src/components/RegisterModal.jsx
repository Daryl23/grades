import { X, UserPlus } from "lucide-react";

const RegisterModal = ({
  showRegister,
  setShowRegister,
  registerForm,
  registerError,
  registerSuccess,
  handleRegisterChange,
  handleRegisterSubmit,
}) => {
  if (!showRegister) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-l bg-white/80 p-6 shadow-l backdrop-blur-xl">
        <button
          className="absolute right-3 top-3 text-gray-500 transition hover:text-gray-800"
          onClick={() => setShowRegister(false)}
        >
          <X />
        </button>

        {/* Header with Icon */}
        <div className="mb-6 flex items-center space-x-3">
          <UserPlus className="h-8 w-8 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-800">Register Account</h2>
        </div>

        <form
          onSubmit={handleRegisterSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {[
            { label: "Email", key: "email" },
            { label: "SR Code", key: "srCode" },
            { label: "First Name", key: "firstName" },
            { label: "Last Name", key: "lastName" },
            { label: "Class Code", key: "classCode" },
          ].map(({ label, key }) => (
            <div key={key} className="col-span-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                {label}
              </label>
              <input
                type="text"
                value={registerForm[key]}
                onChange={(e) => handleRegisterChange(key, e.target.value)}
                className="w-full rounded-m border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          ))}

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={registerForm.password}
              onChange={(e) => handleRegisterChange("password", e.target.value)}
              className="w-full rounded-m border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={registerForm.confirmPassword}
              onChange={(e) =>
                handleRegisterChange("confirmPassword", e.target.value)
              }
              className="w-full rounded-m border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {registerError && (
            <div className="col-span-2 rounded-m border border-red-300 bg-red-100 px-4 py-2 text-sm text-red-800">
              {registerError}
            </div>
          )}

          {registerSuccess && (
            <div className="col-span-2 rounded-m border border-green-300 bg-green-100 px-4 py-2 text-sm text-green-800">
              {registerSuccess}
            </div>
          )}

          <div className="col-span-2">
            <button
              type="submit"
              className="w-full rounded-m bg-red-500 px-4 py-2 text-white transition hover:bg-red-700"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
