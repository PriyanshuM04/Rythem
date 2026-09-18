import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import { authService } from "../../services/authService";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token ? "" : "This confirmation link is invalid or has expired."
  );
  // Guards against React StrictMode's double effect invocation: the backend
  // marks the token as used on the first call, so a second call would 410.
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!token || attemptedRef.current) return;
    attemptedRef.current = true;

    (async () => {
      try {
        await authService.confirmEmail(token);
        setStatus("success");
      } catch (err) {
        const detail = err.response?.data?.detail;
        setStatus("error");
        setMessage(
          typeof detail === "string"
            ? detail
            : "This confirmation link is invalid or has expired."
        );
      }
    })();
  }, [token]);

  return (
    <AuthCard title="Confirm Email">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-gray-400">Confirming your email...</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="w-10 h-10 text-accent" />
          <p className="text-gray-400">Email confirmed, you can now log in.</p>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="w-10 h-10 text-red-400" />
          <p className="text-gray-400">{message}</p>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Back to Login
          </Button>
        </div>
      )}
    </AuthCard>
  );
}
