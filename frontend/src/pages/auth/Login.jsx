import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../../components/ui/AuthCard";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authService.login(identifier, password);
      // Backend only returns a token right now, no user object.
      // Storing token; user details will need a separate /users/me call once that endpoint exists.
      login({ username: identifier }, data.access_token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back">
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <Input
          type="text"
          placeholder="Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex justify-between font-sans text-xs text-gray-400 -mt-2">
          <button type="button" onClick={() => navigate("/forgot-password")} className="hover:text-white">
            Forgot Password?
          </button>
          <button type="button" onClick={() => navigate("/signup")} className="hover:text-white">
            Sign Up
          </button>
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div className="flex flex-col items-center gap-2 w-full">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Please wait..." : "Continue"}
          </Button>
          <span className="text-xs text-gray-500 font-sans">or</span>
          <Button type="button" variant="google" className="max-w-[220px]">
            Continue with Google
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}