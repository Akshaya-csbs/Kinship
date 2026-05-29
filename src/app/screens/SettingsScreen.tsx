import { motion } from "motion/react";
import { 
  User, Bell, Lock, Globe, Palette, HelpCircle, 
  LogOut, ChevronRight, Shield, Moon, Sun 
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import GlassCard from "../components/GlassCard";

const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Edit Profile", path: "/profile/me" },
      { icon: Lock, label: "Privacy & Security", path: "/settings/privacy" },
      { icon: Shield, label: "Account Settings", path: "/settings/account" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", path: "/settings/notifications", badge: "3" },
      { icon: Globe, label: "Language & Region", path: "/settings/language" },
      { icon: Palette, label: "Appearance", path: "/settings/appearance", hasToggle: true },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help Center", path: "/help" },
      { icon: Globe, label: "Terms of Service", path: "/terms" },
      { icon: Shield, label: "Privacy Policy", path: "/privacy" },
    ],
  },
];

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-foreground hover:text-primary transition-colors mb-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6 cursor-pointer hover:border-primary/50 transition-all">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">Alex Morgan</h2>
                <p className="text-sm text-muted-foreground">@alexmorgan</p>
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
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h3>
            <GlassCard className="overflow-hidden">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const isLast = itemIndex === section.items.length - 1;

                return (
                  <div key={item.label}>
                    <button
                      onClick={() => !item.hasToggle && navigate(item.path)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="flex-1 text-left text-foreground font-medium">
                        {item.label}
                      </span>
                      
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}

                      {item.hasToggle ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDarkMode(!darkMode);
                          }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            darkMode ? "bg-primary" : "bg-secondary"
                          }`}
                        >
                          <motion.div
                            animate={{ x: darkMode ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg"
                          >
                            {darkMode ? (
                              <Moon className="w-3 h-3 text-primary" />
                            ) : (
                              <Sun className="w-3 h-3 text-yellow-500" />
                            )}
                          </motion.div>
                        </button>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-4"
        >
          <p className="text-sm text-muted-foreground mb-1">Kinship</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        </motion.div>

        {/* Logout button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl font-medium transition-all bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
