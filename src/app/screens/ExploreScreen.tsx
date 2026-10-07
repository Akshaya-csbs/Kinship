import { motion } from "motion/react";
import {
  Search,
  MapPin,
  TrendingUp,
  Sparkles,
  Music,
  Palette,
  Camera,
  Film,
  Heart,
  Mic2,
  Video,
  Pen,
  Loader2,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";

const CATEGORY_STYLES: Record<string, { icon: any; color: string }> = {
  music: { icon: Music, color: "from-pink-500 to-rose-500" },
  dance: { icon: Heart, color: "from-purple-500 to-pink-500" },
  choreography: { icon: Heart, color: "from-fuchsia-500 to-purple-500" },
  art: { icon: Palette, color: "from-blue-500 to-cyan-500" },
  painting: { icon: Pen, color: "from-indigo-500 to-blue-500" },
  photography: { icon: Camera, color: "from-orange-500 to-yellow-500" },
  video: { icon: Video, color: "from-red-500 to-orange-500" },
  film: { icon: Film, color: "from-violet-500 to-purple-500" },
  singing: { icon: Mic2, color: "from-fuchsia-500 to-pink-500" },
};
const DEFAULT_STYLE = { icon: Sparkles, color: "from-green-500 to-emerald-500" };

function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function ExploreScreen() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<[string, number][]>([]);
  const [activeTalent, setActiveTalent] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [creators, setCreators] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTalentStats().then((stats) => setCategories(Object.entries(stats).slice(0, 6))).catch(() => undefined);
    api.getRecommendedCreators().then(setRecommended).catch(() => undefined);
  }, []);

  // search runs on the Java backend (SQL LIKE); debounced while typing
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result =
          query.trim() || activeTalent
            ? await api.getCreatorsAsync(query.trim(), activeTalent ?? undefined)
            : await api.getTrendingCreators();
        setCreators(result);
      } catch (err) {
        toast.error(errorMessage(err));
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, activeTalent]);

  const toggleFollow = async (creator: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await api.followUser(creator.id);
      const apply = (list: any[]) =>
        list.map((c) => (c.id === creator.id ? { ...c, isFollowing: result.following, followers: result.followers } : c));
      setCreators(apply);
      setRecommended(apply);
      toast.success(result.following ? `You are now following ${creator.name}` : `Unfollowed ${creator.name}`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const followButton = (creator: any, small = false) =>
    creator.isMe ? null : (
      <button
        onClick={(e) => toggleFollow(creator, e)}
        className={`${small ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"} rounded-lg font-medium transition-colors ${
          creator.isFollowing ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-primary text-white hover:bg-primary/90"
        }`}
      >
        {creator.isFollowing ? "Following" : "Follow"}
      </button>
    );

  const heading = query.trim()
    ? `Results for "${query.trim()}"`
    : activeTalent
      ? `${activeTalent} creators`
      : "Trending Creators";

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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creators, talents, cities..."
              className="w-full bg-secondary/50 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-8">
        {/* Categories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Browse by Talent</h2>
            {activeTalent && (
              <button onClick={() => setActiveTalent(null)} className="text-sm text-primary">
                Clear filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(([label, count], index) => {
              const style = CATEGORY_STYLES[label.toLowerCase()] ?? DEFAULT_STYLE;
              const Icon = style.icon;
              const active = activeTalent === label;
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard
                    onClick={() => setActiveTalent(active ? null : label)}
                    className={`p-4 cursor-pointer hover:border-primary/50 transition-all active:scale-95 ${
                      active ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${style.color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {count} creator{count === 1 ? "" : "s"}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Trending / search results */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="space-y-4">
            {!loading && creators.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No creators found.</p>
            )}
            {creators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index, 5) * 0.08 }}
              >
                <GlassCard
                  onClick={() => navigate(`/profile/${creator.id}`)}
                  className="p-4 cursor-pointer hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={creator.image}
                      alt={creator.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-foreground truncate">{creator.name}</h3>
                        {creator.verified && <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{creator.talents.join(" · ")}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {creator.location} · {formatCount(creator.followers)} followers
                      </p>
                    </div>
                    {followButton(creator)}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recommended (talent matching runs in parallel threads on the server) */}
        {recommended.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Recommended for You</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
              {recommended.map((creator) => (
                <GlassCard
                  key={creator.id}
                  onClick={() => navigate(`/profile/${creator.id}`)}
                  className="flex-shrink-0 w-40 p-4 cursor-pointer hover:border-primary/50 transition-all"
                >
                  <img
                    src={creator.image}
                    alt={creator.name}
                    className="w-24 h-24 rounded-2xl object-cover mx-auto mb-3 ring-2 ring-primary/20"
                  />
                  <h3 className="font-semibold text-foreground text-center mb-1 text-sm truncate">{creator.name}</h3>
                  <p className="text-xs text-muted-foreground text-center mb-1 truncate">{creator.talents.join(" · ")}</p>
                  <p className="text-xs text-primary text-center mb-2">
                    {creator.matchScore}% · {creator.matchReason}
                  </p>
                  <div className="flex justify-center">{followButton(creator, true)}</div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
