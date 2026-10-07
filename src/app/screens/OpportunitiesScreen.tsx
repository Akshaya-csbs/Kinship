import { motion } from "motion/react";
import {
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Flame,
  Award,
  Briefcase,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";

// value = Opportunity subclass type on the Java side
const categories = [
  { icon: Briefcase, label: "All", value: "All" },
  { icon: Flame, label: "Gigs", value: "Gig" },
  { icon: Users, label: "Collabs", value: "Collab" },
  { icon: Award, label: "Competitions", value: "Competition" },
];

export default function OpportunitiesScreen() {
  const [category, setCategory] = useState("All");
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getOpportunitiesAsync(category)
      .then(setOpportunities)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [category]);

  const handleApply = async (opportunity: any) => {
    setApplying(opportunity.id);
    try {
      const result = await api.applyToOpportunity(opportunity.id);
      setOpportunities((list) =>
        list.map((o) => (o.id === opportunity.id ? { ...o, applied: true, applicants: result.applicants } : o))
      );
      if (result.alreadyApplied) {
        toast.info("You have already applied to this opportunity");
      } else {
        toast.success(`Application sent to ${opportunity.organizer}`);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Opportunities
          </h1>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {categories.map((c) => {
              const Icon = c.icon;
              const active = c.value === category;
              return (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    active
                      ? "bg-gradient-to-r from-primary to-accent text-white"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium whitespace-nowrap">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && opportunities.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No opportunities in this category yet.</p>
        )}
        {!loading &&
          opportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard
                onClick={() => setExpanded(expanded === opportunity.id ? null : opportunity.id)}
                className={`p-5 cursor-pointer hover:border-primary/50 transition-all ${
                  opportunity.featured ? "ring-2 ring-primary/20" : ""
                }`}
              >
                {opportunity.featured && (
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-medium text-orange-500 uppercase">Featured</span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{opportunity.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{opportunity.organizer}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {opportunity.talents.map((talent: string) => (
                        <span
                          key={talent}
                          className="px-2 py-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg text-sm"
                        >
                          {talent}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-primary/10 rounded-full">
                    <span className="text-xs text-primary font-medium capitalize">{opportunity.type}</span>
                  </div>
                </div>

                {expanded === opportunity.id && (
                  <div className="mb-4 space-y-3">
                    {opportunity.image && (
                      <img src={opportunity.image} alt="" className="w-full h-40 object-cover rounded-xl" />
                    )}
                    <p className="text-sm text-foreground/90">{opportunity.description}</p>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{opportunity.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{opportunity.compensation}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
                  <div className="text-sm text-muted-foreground">
                    <div>{opportunity.deadline}</div>
                    <div className="text-xs">{opportunity.applicants} applicants</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!opportunity.applied) handleApply(opportunity);
                    }}
                    disabled={opportunity.applied || applying === opportunity.id}
                    className={`px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      opportunity.applied
                        ? "bg-secondary text-foreground cursor-default"
                        : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                    }`}
                  >
                    {applying === opportunity.id && <Loader2 className="w-4 h-4 animate-spin" />}
                    {opportunity.applied && <CheckCircle2 className="w-4 h-4" />}
                    {opportunity.applied ? "Applied" : opportunity.actionLabel}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
      </div>

      <BottomNav />
    </div>
  );
}
