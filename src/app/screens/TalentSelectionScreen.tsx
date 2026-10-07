import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Music, Palette, Camera, Utensils, Dumbbell, Pen, Film, Gamepad2, Heart, Mic2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import GlassCard from "../components/GlassCard";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";

const talents = [
  { id: "music", icon: Music, label: "Music", gradient: "from-pink-500 to-rose-500" },
  { id: "dance", icon: Heart, label: "Dance", gradient: "from-purple-500 to-pink-500" },
  { id: "art", icon: Palette, label: "Art", gradient: "from-blue-500 to-cyan-500" },
  { id: "photography", icon: Camera, label: "Photography", gradient: "from-orange-500 to-yellow-500" },
  { id: "cooking", icon: Utensils, label: "Cooking", gradient: "from-red-500 to-orange-500" },
  { id: "fitness", icon: Dumbbell, label: "Fitness", gradient: "from-green-500 to-emerald-500" },
  { id: "writing", icon: Pen, label: "Writing", gradient: "from-indigo-500 to-purple-500" },
  { id: "film", icon: Film, label: "Film", gradient: "from-violet-500 to-purple-500" },
  { id: "gaming", icon: Gamepad2, label: "Gaming", gradient: "from-cyan-500 to-blue-500" },
  { id: "singing", icon: Mic2, label: "Singing", gradient: "from-fuchsia-500 to-pink-500" },
];

export default function TalentSelectionScreen() {
  const [selectedTalents, setSelectedTalents] = useState<string[]>(() => {
    const current: string[] = api.getCurrentUser()?.talents ?? [];
    return talents
      .filter((t) => current.some((c) => c.toLowerCase() === t.label.toLowerCase()))
      .map((t) => t.id);
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const toggleTalent = (id: string) => {
    setSelectedTalents((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedTalents.length === 0 || saving) return;
    setSaving(true);
    try {
      const labels = talents.filter((t) => selectedTalents.includes(t.id)).map((t) => t.label);
      await api.updateTalents(labels);
      toast.success("Talents saved to your profile");
      navigate("/home");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 mt-4"
      >
        <h1 className="text-3xl font-bold text-foreground mb-3">
          What are your talents?
        </h1>
        <p className="text-muted-foreground text-lg">
          Select all that apply. This helps us connect you with the right creators.
        </p>
      </motion.div>

      {/* Talent grid */}
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          {talents.map((talent, index) => {
            const Icon = talent.icon;
            const isSelected = selectedTalents.includes(talent.id);

            return (
              <motion.div
                key={talent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  onClick={() => toggleTalent(talent.id)}
                  className={`p-6 cursor-pointer transition-all active:scale-95 relative overflow-hidden ${
                    isSelected
                      ? "ring-2 ring-primary shadow-xl shadow-primary/20"
                      : "hover:border-white/20"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}

                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${talent.gradient} rounded-2xl flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-foreground font-medium">{talent.label}</h3>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-6 left-6 right-6 max-w-md mx-auto"
      >
        <button
          onClick={handleContinue}
          disabled={selectedTalents.length === 0 || saving}
          className={`w-full py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
            selectedTalents.length > 0
              ? "bg-gradient-to-r from-primary to-accent text-white hover:shadow-2xl hover:shadow-primary/30 active:scale-95"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          }`}
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Continue {selectedTalents.length > 0 && `(${selectedTalents.length} selected)`}
        </button>
      </motion.div>
    </div>
  );
}
