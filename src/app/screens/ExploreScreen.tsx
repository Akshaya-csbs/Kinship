import { motion } from "motion/react";
import { Search, MapPin, TrendingUp, Sparkles, Music, Palette, Camera, Utensils, Dumbbell, Film } from "lucide-react";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";

const categories = [
  { icon: Music, label: "Music", color: "from-pink-500 to-rose-500", count: "15.2k" },
  { icon: Palette, label: "Art", color: "from-blue-500 to-cyan-500", count: "12.8k" },
  { icon: Camera, label: "Photography", color: "from-orange-500 to-yellow-500", count: "18.5k" },
  { icon: Film, label: "Film", color: "from-violet-500 to-purple-500", count: "9.3k" },
  { icon: Utensils, label: "Cooking", color: "from-red-500 to-orange-500", count: "7.1k" },
  { icon: Dumbbell, label: "Fitness", color: "from-green-500 to-emerald-500", count: "11.2k" },
];

const trendingCreators = [
  {
    id: 1,
    name: "Sarah Kim",
    talent: "🎨 Visual Artist",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300",
    followers: "34.2k",
    featuredWork: "https://images.unsplash.com/photo-1613667013398-0ab87d27641b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  },
  {
    id: 2,
    name: "David Torres",
    talent: "🎵 Producer",
    avatar: "https://images.unsplash.com/photo-1618673747378-7e0d3561371a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300",
    followers: "28.7k",
    featuredWork: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  },
  {
    id: 3,
    name: "Emma Zhang",
    talent: "📸 Photographer",
    avatar: "https://images.unsplash.com/photo-1660092626225-f291ab2970b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300",
    followers: "42.1k",
    featuredWork: "https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  },
];

const nearbyCreators = [
  {
    id: 1,
    name: "Marcus Lee",
    talent: "💃 Dancer",
    avatar: "https://images.unsplash.com/photo-1536924430914-91f9e2041b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    distance: "2.3 mi",
  },
  {
    id: 2,
    name: "Olivia Chen",
    talent: "🎬 Filmmaker",
    avatar: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    distance: "3.8 mi",
  },
  {
    id: 3,
    name: "James Park",
    talent: "🍳 Chef",
    avatar: "https://images.unsplash.com/photo-1587397845856-e6cf49176c70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    distance: "5.1 mi",
  },
];

export default function ExploreScreen() {
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
                              src={creator.avatar}
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
                  src={creator.avatar}
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
