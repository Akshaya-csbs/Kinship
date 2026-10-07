import { motion } from "motion/react";
import { Search, MapPin, TrendingUp, Sparkles, Music, Palette, Camera, Utensils, Dumbbell, Film } from "lucide-react";
import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import { KinshipPlatformFacade } from "../core/services/KinshipPlatformFacade";

const categories = [
  { icon: Music, label: "Music", color: "from-pink-500 to-rose-500", count: "15.2k" },
  { icon: Palette, label: "Art", color: "from-blue-500 to-cyan-500", count: "12.8k" },
  { icon: Dumbbell, label: "Fitness", color: "from-green-500 to-emerald-500", count: "11.2k" },
];

export default function ExploreScreen() {
  const [trendingCreators, setTrendingCreators] = useState<any[]>([]);
  const [nearbyCreators, setNearbyCreators] = useState<any[]>([]);

  useEffect(() => {
    KinshipPlatformFacade.getInstance().getCreatorsAsync().then(creators => {
      if (creators && creators.length > 0) {
        setTrendingCreators(creators);
        setNearbyCreators([...creators].reverse());
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Explore
          </h1>
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search creators, talents, projects..."
              className="w-full bg-secondary/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-8">
        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Browse by Talent</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="p-4 cursor-pointer hover:border-primary/50 transition-all active:scale-95">
                    <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{category.label}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} creators</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Trending Creators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Trending Creators</h2>
          </div>
          <div className="space-y-4">
            {trendingCreators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all">
                  <div className="flex gap-4">
                    <img
                      src={creator.featuredWork}
                      alt=""
                      className="w-32 h-32 object-cover"
                    />
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={creator.image || creator.avatar}
                              alt={creator.name}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                            />
                            <div>
                              <h3 className="font-semibold text-foreground">{creator.name}</h3>
                              <p className="text-sm text-muted-foreground">{creator.talent}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{creator.followers} followers</span>
                        <button className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Nearby Creators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Nearby Creators</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {nearbyCreators.map((creator) => (
              <GlassCard
                key={creator.id}
                className="flex-shrink-0 w-40 p-4 cursor-pointer hover:border-primary/50 transition-all"
              >
                <img
                  src={creator.image || creator.avatar}
                  alt={creator.name}
                  className="w-24 h-24 rounded-2xl object-cover mx-auto mb-3 ring-2 ring-primary/20"
                />
                <h3 className="font-semibold text-foreground text-center mb-1 text-sm">
                  {creator.name}
                </h3>
                <p className="text-xs text-muted-foreground text-center mb-2">
                  {creator.talent}
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{creator.distance}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
