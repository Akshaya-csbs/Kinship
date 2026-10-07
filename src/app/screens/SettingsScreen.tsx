import { motion } from "motion/react";
import {
  User,
  Bell,
  Lock,
  Globe,
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Moon,
  Sun,
  FileText,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import GlassCard from "../components/GlassCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { api, errorMessage, SESSION_EVENT } from "../core/services/KinshipPlatformFacade";
import { getTheme, setTheme } from "../core/theme";

const LANGUAGE_KEY = "kinship.language";
const LANGUAGES = ["English", "Español", "Français", "हिन्दी", "தமிழ்"];

type DialogKey = "privacy" | "account" | "language" | "help" | "terms" | "policy" | null;

interface SettingsItem {
  icon: any;
  label: string;
  badge?: string;
  hasToggle?: boolean;
  action: () => void;
}

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(getTheme() === "dark");
  const [user, setUser] = useState<any>(api.getCurrentUser());
  const [dialog, setDialog] = useState<DialogKey>(null);
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(LANGUAGE_KEY) ?? "English";
    } catch {
      return "English";
    }
  });

  useEffect(() => {
    api.refreshCurrentUser().then(setUser).catch((err) => toast.error(errorMessage(err)));
    const onSession = () => setUser(api.getCurrentUser());
    window.addEventListener(SESSION_EVENT, onSession);
    return () => window.removeEventListener(SESSION_EVENT, onSession);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    setTheme(next ? "dark" : "light");
  };

  const chooseLanguage = (lang: string) => {
    setLanguage(lang);
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {}
    toast.success(`Language set to ${lang}`);
    setDialog(null);
  };

  const handleLogout = async () => {
    await api.logout().catch(() => undefined);
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };

  const unread = user?.unreadNotifications ?? 0;

  const settingsSections: { title: string; items: SettingsItem[] }[] = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Edit Profile", action: () => navigate("/profile/me") },
        { icon: Lock, label: "Privacy & Security", action: () => setDialog("privacy") },
        { icon: Shield, label: "Account Settings", action: () => setDialog("account") },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", badge: unread > 0 ? String(unread) : undefined, action: () => navigate("/notifications") },
        { icon: Globe, label: "Language & Region", action: () => setDialog("language") },
        { icon: Palette, label: "Appearance", hasToggle: true, action: toggleTheme },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", action: () => setDialog("help") },
        { icon: FileText, label: "Terms of Service", action: () => setDialog("terms") },
        { icon: Shield, label: "Privacy Policy", action: () => setDialog("policy") },
      ],
    },
  ];

  const dialogs: Record<Exclude<DialogKey, null>, { title: string; description: string; body: ReactNode }> = {
    privacy: {
      title: "Privacy & Security",
      description: "How Kinship protects your account",
      body: (
        <div className="space-y-3 text-sm">
          <p>Your password is never stored. The Java backend saves only a salted PBKDF2-SHA256 hash in MySQL.</p>
          <p>Each sign-in creates a random session token that expires after 7 days. Signing out deletes it from the database.</p>
          <button onClick={handleLogout} className="w-full py-2 rounded-xl bg-destructive/10 text-destructive">
            Sign out of this device
          </button>
        </div>
      ),
    },
    account: {
      title: "Account Settings",
      description: "Your Kinship account",
      body: (
        <div className="space-y-2 text-sm">
          <Row label="Name" value={user?.name} />
          <Row label="Username" value={user?.username} />
          <Row label="Email" value={user?.email} />
          <Row label="Location" value={user?.location} />
          <Row label="Talents" value={user?.talents?.join(", ") || "None yet"} />
          <Row label="Member since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""} />
          <div className="flex gap-2 pt-2">
            <button onClick={() => navigate("/profile/me")} className="flex-1 py-2 rounded-xl bg-primary text-white">
              Edit profile
            </button>
            <button onClick={() => navigate("/talents")} className="flex-1 py-2 rounded-xl bg-secondary">
              Edit talents
            </button>
          </div>
        </div>
      ),
    },
    language: {
      title: "Language & Region",
      description: "Choose your preferred language",
      body: (
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => chooseLanguage(lang)}
              className={`w-full text-left px-4 py-3 rounded-xl ${lang === language ? "bg-primary text-white" : "bg-secondary"}`}
            >
              {lang}
            </button>
          ))}
        </div>
      ),
    },
    help: {
      title: "Help Center",
      description: "Frequently asked questions",
      body: (
        <div className="space-y-3 text-sm">
          <Faq q="How do I post?" a="Tap the + button on the Home feed, write a caption and optionally add an image URL." />
          <Faq q="How do I collaborate?" a="Open a creator's profile, tap ⋯ and choose 'Invite to collaborate', or start a project on the Collaborations page." />
          <Faq q="How do I apply to an opportunity?" a="Open Opportunities from the Home menu and tap the apply button. You can apply once per opportunity." />
          <Faq q="The app says it can't reach the backend" a="Start MySQL and the Java server (mvn compile exec:java), then refresh." />
        </div>
      ),
    },
    terms: {
      title: "Terms of Service",
      description: "The short version",
      body: (
        <div className="space-y-2 text-sm text-foreground/90">
          <p>Be respectful to other creators. Only post work you own or have permission to share.</p>
          <p>Collaboration agreements are between the creators involved; Kinship only connects you.</p>
        </div>
      ),
    },
    policy: {
      title: "Privacy Policy",
      description: "What we store",
      body: (
        <div className="space-y-2 text-sm text-foreground/90">
          <p>We store your profile, posts, likes, comments, messages and applications in a MySQL database.</p>
          <p>Your email is only visible to you. Messages are only visible to you and the other participant.</p>
        </div>
      ),
    },
  };

  const current = dialog ? dialogs[dialog] : null;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <button onClick={() => navigate(-1)} className="text-foreground hover:text-primary transition-colors mb-4">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard onClick={() => navigate("/profile/me")} className="p-6 cursor-pointer hover:border-primary/50 transition-all">
            <div className="flex items-center gap-4">
              <img
                src={user?.image}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20 bg-muted"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.username}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Settings sections */}
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">{section.title}</h3>
            <GlassCard className="overflow-hidden">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const isLast = itemIndex === section.items.length - 1;

                return (
                  <div key={item.label}>
                    <button
                      onClick={item.action}
                      className="w-full p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="flex-1 text-left text-foreground font-medium">{item.label}</span>

                      {item.badge && (
                        <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">{item.badge}</span>
                      )}

                      {item.hasToggle ? (
                        <span
                          role="switch"
                          aria-checked={darkMode}
                          className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? "bg-primary" : "bg-secondary"}`}
                        >
                          <motion.span
                            animate={{ x: darkMode ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg"
                          >
                            {darkMode ? <Moon className="w-3 h-3 text-primary" /> : <Sun className="w-3 h-3 text-yellow-500" />}
                          </motion.span>
                        </span>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    {!isLast && <div className="h-px bg-white/5 mx-4" />}
                  </div>
                );
              })}
            </GlassCard>
          </motion.div>
        ))}

        {/* App version */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center pt-4">
          <p className="text-sm text-muted-foreground mb-1">Kinship</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        </motion.div>

        {/* Logout button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl font-medium transition-all bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </motion.div>
      </div>

      <Dialog open={!!current} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{current?.title}</DialogTitle>
            <DialogDescription>{current?.description}</DialogDescription>
          </DialogHeader>
          {current?.body}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-white/5">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right break-all">{value || "—"}</span>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <p className="font-medium">{q}</p>
      <p className="text-muted-foreground">{a}</p>
    </div>
  );
}
