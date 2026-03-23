import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate  = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("isAdminLoggedIn", "true");
      navigate("/admin");
    } else {
      setError("Invalid username or password.");
    }
  };

  // Allow pressing Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c12] text-white">
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-2xl w-[380px] space-y-6 shadow-2xl">

        {/* Logo + Title */}
        <div className="text-center space-y-2">
          <div className="text-4xl">🏛️</div>
          <h2 className="text-2xl font-bold">GovConnect AI</h2>
          <p className="text-slate-500 text-sm">Admin Portal — Authorized Access Only</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Username
            </label>
            <input
              placeholder="Enter username"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-500 transition py-3 rounded-lg font-bold text-white"
        >
          Login to Admin Panel
        </button>

        {/* Back link */}
        <p className="text-center text-slate-600 text-xs">
          Not an admin?{" "}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate("/")}
          >
            Go back to home
          </span>
        </p>

      </div>
    </div>
  );
}