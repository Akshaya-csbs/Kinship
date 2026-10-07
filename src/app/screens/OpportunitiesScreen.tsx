import { motion } from "motion/react";
import { Sparkles, MapPin, Calendar, DollarSign, Users, Flame, Award, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import { KinshipPlatformFacade } from "../core/services/KinshipPlatformFacade";

const categories = [
  { icon: Briefcase, label: "All", active: true },
  { icon: Flame, label: "Gigs", active: false },
  { icon: Users, label: "Collabs", active: false },
  { icon: Award, label: "Competitions", active: false },
];

export default function OpportunitiesScreen() {
  const [opportunities, setOpportunities] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/opportunities")
      .then(res => res.json())
      .then(setOpportunities)
      .catch(console.error);
  }, []);

  const handleApply = (id: number) => {
    fetch(`http://localhost:8080/api/opportunities/apply?id=${id}`, { method: 'POST' })
      .then(() => fetch("http://localhost:8080/api/opportunities").then(res => res.json()).then(setOpportunities));
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
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.label}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    category.active
                      ? "bg-gradient-to-r from-primary to-accent text-white"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium whitespace-nowrap">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
        {opportunities.map((opportunity, index) => (
          <motion.div
            key={opportunity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard
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

              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {opportunity.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{opportunity.organizer}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {opportunity.talents.map((talent, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg text-sm"
                      >
                        {talent}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-3 py-1 bg-primary/10 rounded-full">
                  <span className="text-xs text-primary font-medium capitalize">
                    {opportunity.type}
                  </span>
                </div>
              </div>

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

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-sm text-muted-foreground">{opportunity.deadline}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleApply(opportunity.id); }}
                  className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
                >
                  {opportunity.applicants > 0 ? `Apply (${opportunity.applicants})` : "Apply Now"}
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
