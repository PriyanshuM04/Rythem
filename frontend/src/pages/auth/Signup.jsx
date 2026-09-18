import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import AuthCard from "../../components/ui/AuthCard";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import { authService } from "../../services/authService";

export default function Signup() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.register(identifier, password);
      setRegistered(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((d) => d.msg).join(", ")
        : detail || "Signup failed. Try a different email/username.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <AuthCard title="Check your email">
        <div className="flex flex-col items-center gap-4 text-center">
          <MailCheck className="w-10 h-10 text-accent" />
          <p className="text-gray-400">
            We sent a confirmation link to{" "}
            <span className="text-white font-medium">{identifier}</span>. Open it to
            verify your account, then log in.
          </p>
          <p className="text-xs text-gray-500 font-sans">
            Didn&apos;t get it? Check your spam or promotions folder.
          </p>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Sign up">
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
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div className="flex flex-col items-center gap-2 w-full">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Please wait..." : "Continue"}
          </Button>
          <span className="text-xs text-gray-500 font-sans">or</span>
          <Button type="button" variant="google" className="max-w-55">
            Continue with Google
          </Button>
        </div>
        <p className="text-center text-sm text-gray-400 font-sans">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/login")} className="text-white hover:underline">
            Log in
          </button>
        </p>
      </form>
    </AuthCard>
  );
}