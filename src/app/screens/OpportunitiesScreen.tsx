import { motion } from "motion/react";
import { Sparkles, MapPin, Calendar, DollarSign, Users, Flame, Award, Briefcase } from "lucide-react";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";

const opportunities = [
  {
    id: 1,
    type: "gig",
    title: "Live Performance at Summer Music Festival",
    organizer: "Sunset Festival",
    location: "Los Angeles, CA",
    date: "June 15, 2026",
    compensation: "$500-1000",
    talents: ["🎵", "🎸"],
    deadline: "3 days left",
    featured: true,
  },
  {
    id: 2,
    type: "collaboration",
    title: "Music Video Production",
    organizer: "Independent Film Crew",
    location: "Remote",
    date: "Flexible",
    compensation: "Revenue Share",
    talents: ["🎬", "🎵"],
    deadline: "2 weeks left",
    featured: false,
  },
  {
    id: 3,
    type: "competition",
    title: "Urban Art Competition 2026",
    organizer: "City Arts Council",
    location: "New York, NY",
    date: "July 1, 2026",
    compensation: "$5000 Prize",
    talents: ["🎨"],
    deadline: "1 month left",
    featured: true,
  },
  {
    id: 4,
    type: "workshop",
    title: "Advanced Photography Workshop",
    organizer: "CreativeLens Studio",
    location: "San Francisco, CA",
    date: "June 20, 2026",
    compensation: "Free",
    talents: ["📸"],
    deadline: "1 week left",
    featured: false,
  },
  {
    id: 5,
    type: "audition",
    title: "Dancer Audition - Broadway Show",
    organizer: "Theater Productions Inc",
    location: "New York, NY",
    date: "June 10, 2026",
    compensation: "$2000-3000/week",
    talents: ["💃"],
    deadline: "5 days left",
    featured: true,
  },
];

const categories = [
  { icon: Briefcase, label: "All", active: true },
  { icon: Flame, label: "Gigs", active: false },
  { icon: Users, label: "Collabs", active: false },
  { icon: Award, label: "Competitions", active: false },
];

export default function OpportunitiesScreen() {
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
                <button className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95">
                  Apply Now
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
