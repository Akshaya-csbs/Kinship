import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, User, Sparkles, Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import GlassCard from "../components/GlassCard";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";

const DEMO_EMAIL = "sofia@kinship.app";
const DEMO_PASSWORD = "password123";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const afterSignIn = (user: any, isNew: boolean) => {
    toast.success(isNew ? `Welcome to Kinship, ${user.name}!` : `Welcome back, ${user.name}!`);
    navigate(isNew || !user.talents?.length ? "/talents" : "/home", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    if (!isLogin && name.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    setLoading(true);
    try {
      const user = isLogin
        ? await api.login(email.trim(), password)
        : await api.register(name.trim(), email.trim(), password);
      afterSignIn(user, !isLogin);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      afterSignIn(await api.login(DEMO_EMAIL, DEMO_PASSWORD), false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info("Password reset by email is not set up yet. Demo accounts use the password \"password123\".");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#0f0f0f] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-primary/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Welcome Back" : "Join Kinship"}
          </h1>
          <p className="text-muted-foreground text-center">
            {isLogin
              ? "Sign in to continue your creative journey"
              : "Start connecting with talented creators"}
          </p>
        </motion.div>

        {/* Auth form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      placeholder="Enter your name"
                      className="w-full bg-secondary/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="w-full bg-secondary/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
                    className="w-full bg-secondary/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 mt-6 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Demo account */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-white text-gray-900 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-95 disabled:opacity-60"
            >
              <PlayCircle className="w-5 h-5" />
              Try the demo account
            </button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {DEMO_EMAIL} / {DEMO_PASSWORD}
            </p>

            {/* Toggle auth mode */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-primary hover:text-primary/80 transition-colors">
                  {isLogin ? "Sign Up" : "Sign In"}
                </span>
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
