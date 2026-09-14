import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthCard from "../../components/ui/AuthCard";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    // TODO: wire to backend /auth/reset-password with { token, newPassword } once ready
    setLoading(false);
    navigate("/login");
  };

  if (!token) {
    return (
      <AuthCard title="Reset Password">
        <p className="text-center text-gray-400">
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <Button variant="primary" onClick={() => navigate("/forgot-password")}>
          Back to Reset Password
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset Password">
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <PasswordInput
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <PasswordInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-center">
          <Button type="submit" variant="primary" disabled={loading} className="w-auto px-6">
            {loading ? "Please wait..." : "Change Password"}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}