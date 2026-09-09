import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../../components/ui/AuthCard";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: wire to backend /auth/login once ready
    setLoading(false);
  };

  return (
    <AuthCard title="Welcome back">
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex justify-between font-sans text-xs text-gray-400 -mt-1">
          <button type="button" onClick={() => navigate("/forgot-password")} className="hover:text-white">
            Forgot Password?
          </button>
          <button type="button" onClick={() => navigate("/signup")} className="hover:text-white">
            Sign Up
          </button>
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Please wait..." : "Continue"}
          </Button>
          <span className="text-xs text-gray-500 font-sans">or</span>
          <Button type="button" variant="google" className="max-w-50">
            Continue with Google
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}