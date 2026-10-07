import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Heart, MessageCircle, Share2, MoreVertical, Play, Sparkles, TrendingUp, Users, Cpu } from "lucide-react";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import TalentBadge from "../components/TalentBadge";
import FloatingActionButton from "../components/FloatingActionButton";
import JavaOopInspectorModal from "../components/JavaOopInspectorModal";
import { KinshipPlatformFacade } from "../core/services/KinshipPlatformFacade";

const trendingCollaborations = [
  { title: "Music Video Project", talents: ["🎬", "🎵"], members: 3 },
  { title: "Art Exhibition", talents: ["🎨", "📸"], members: 8 },
];

export default function HomeScreen() {
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  useEffect(() => {
    const facade = KinshipPlatformFacade.getInstance();
    facade.getFeedPostsAsync().then((posts) => setFeedPosts(posts));
  }, []);

  const handleCreatePost = () => {
    const facade = KinshipPlatformFacade.getInstance();
    facade.createPost("Collaborating on a new creative project! ✨", "image", "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800");
    facade.getFeedPostsAsync().then((posts) => setFeedPosts(posts));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Kinship</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInspectorOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Java OOP Engine</span>
            </button>
            <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
              <MoreVertical className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Trending Collaborations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Trending Collaborations</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {trendingCollaborations.map((collab, index) => (
              <GlassCard
                key={index}
                className="flex-shrink-0 w-64 p-4 cursor-pointer hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  {collab.talents.map((talent, i) => (
                    <span key={i} className="text-2xl">{talent}</span>
                  ))}
                </div>
                <h3 className="text-foreground font-medium mb-2">{collab.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{collab.members} creators</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Feed */}
        <div className="space-y-6">
          {feedPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="overflow-hidden">
                {/* Post header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.user.avatar}
                      alt={post.user.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{post.user.name}</h3>
                        {post.badge && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-primary to-accent text-white text-xs rounded-full">
                            {post.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {Array.isArray(post.user.talents) ? post.user.talents.join(" ") : post.user.talents} · {post.time}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Post content */}
                <div className="relative">
                  <img
                    src={post.content}
                    alt=""
                    className="w-full aspect-square object-cover"
                  />
                  {post.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Post actions */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                      <Heart className="w-6 h-6" />
                      <span className="font-medium">{post.likes.toLocaleString()}</span>
                    </button>
                    <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                      <MessageCircle className="w-6 h-6" />
                      <span className="font-medium">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors ml-auto">
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>

                  <p className="text-foreground">
                    <span className="font-semibold">{post.user.name}</span>{" "}
                    <span className="text-foreground/90">{post.caption}</span>
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
      <FloatingActionButton onClick={handleCreatePost} />
      <JavaOopInspectorModal isOpen={isInspectorOpen} onClose={() => setIsInspectorOpen(false)} />
    </div>
  );
}