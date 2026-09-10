import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import AuthCard from "../../components/ui/AuthCard";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const COOLDOWN_SECONDS = 60;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: wire to backend /auth/forgot-password once ready
    setLoading(false);
    setSent(true);
    setCooldown(COOLDOWN_SECONDS);
  };

  const canResend = sent && cooldown === 0;

  return (
    <AuthCard title="Reset Password">
      <form onSubmit={handleSend} className="w-full flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="flex items-center justify-between">
          <Button
            type="submit"
            variant="primary"
            disabled={loading || (sent && cooldown > 0)}
            className="w-auto px-6"
          >
            {sent && cooldown > 0 ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Sent
              </span>
            ) : (
              "Send"
            )}
          </Button>

          {sent && (
            <button
              type="button"
              onClick={canResend ? handleSend : undefined}
              disabled={!canResend}
              className={canResend ? "text-white hover:underline text-sm" : "text-gray-500 text-sm cursor-not-allowed"}
            >
              {canResend ? "Resend" : `Resend in ${cooldown}s`}
            </button>
          )}
        </div>
      </form>
    </AuthCard>
  );
}