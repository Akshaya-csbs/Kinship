import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Search, MapPin, Calendar, Users, Briefcase, Award, GraduationCap } from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { mockOpportunities } from "../data/mockData";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router";

const opportunityTypes = [
  { id: "all", label: "All", icon: Briefcase },
  { id: "events", label: "Events", icon: Calendar },
  { id: "gigs", label: "Gigs", icon: Briefcase },
  { id: "competitions", label: "Competitions", icon: Award },
  { id: "workshops", label: "Workshops", icon: GraduationCap },
];

export function OpportunityScreen() {
  const [activeType, setActiveType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredOpportunities = mockOpportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeType === "all" || opp.type.toLowerCase() === activeType;
    return matchesSearch && matchesType;
  });

  return (
    <MobileContainer>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-accent rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">Opportunities</h1>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-muted/50 border-border rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Type Filters */}
        <div className="px-6 py-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {opportunityTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeType === type.id;

              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Opportunities List */}
        <div className="px-6 pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {filteredOpportunities.length} Opportunities
            </h2>
          </div>

          {filteredOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={opportunity.image}
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary/90 backdrop-blur-sm text-white border-0">
                    {opportunity.type}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg leading-tight">{opportunity.title}</h3>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      {opportunity.category}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {opportunity.description}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{opportunity.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{opportunity.date}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{opportunity.applicants} applicants</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 transition-all rounded-xl">
                  Apply Now
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOpportunities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
              <Briefcase className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">No opportunities found</h3>
            <p className="text-sm text-muted-foreground text-center">
              Try adjusting your filters or check back later for new opportunities
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </MobileContainer>
  );
}
