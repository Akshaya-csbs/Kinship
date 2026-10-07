import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import { api, SESSION_EVENT, UNAUTHORIZED_EVENT } from "../core/services/KinshipPlatformFacade";

/** Redirects to /auth when nobody is signed in or the backend rejects the session. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(api.isLoggedIn());

  useEffect(() => {
    const onSession = () => setLoggedIn(api.isLoggedIn());
    const onUnauthorized = () => {
      toast.error("Your session has expired. Please sign in again.");
      navigate("/auth", { replace: true });
    };
    window.addEventListener(SESSION_EVENT, onSession);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      window.removeEventListener(SESSION_EVENT, onSession);
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, [navigate]);

  if (!loggedIn) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}
