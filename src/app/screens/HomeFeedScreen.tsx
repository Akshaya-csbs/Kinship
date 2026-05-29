import { useState } from "react";
import { motion } from "motion/react";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Sparkles, TrendingUp, Users2 } from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { mockPosts, mockCreators } from "../data/mockData";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router";

export function HomeFeedScreen() {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const navigate = useNavigate();

  const toggleLike = (postId: number) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const toggleSave = (postId: number) => {
    setSavedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  return (
    <MobileContainer>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold">Kinship</h1>
            </div>
            <button
              onClick={() => navigate("/collaborate")}
              className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-xl transition-colors"
            >
              <Users2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Collab</span>
            </button>
          </div>
        </div>

        {/* Trending Creators Carousel */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-muted-foreground">Trending Creators</h2>
            </div>
            <button
              onClick={() => navigate("/opportunities")}
              className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            >
              View Opportunities
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {mockCreators.slice(0, 6).map((creator) => (
              <button
                key={creator.id}
                onClick={() => navigate(`/profile/${creator.id}`)}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-primary/50 ring-offset-2 ring-offset-background">
                    <img
                      src={creator.image}
                      alt={creator.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {creator.verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium max-w-[64px] truncate">
                  {creator.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {mockPosts.map((post, index) => {
            const isLiked = likedPosts.includes(post.id);
            const isSaved = savedPosts.includes(post.id);

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                {/* Post Header */}
                <div className="px-6 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/profile/${post.creator.id}`)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden">
                      <img
                        src={post.creator.image}
                        alt={post.creator.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm">{post.creator.name}</span>
                        {post.creator.verified && (
                          <Sparkles className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                    </div>
                  </button>
                  <button className="p-2 hover:bg-accent rounded-xl transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Post Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={post.media}
                    alt="Post content"
                    className="w-full h-full object-cover"
                  />
                  {post.type === "collab" && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary/90 backdrop-blur-sm text-white border-0">
                        Looking for Collab
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className="flex items-center gap-2 group"
                    >
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className={`transition-colors ${
                          isLiked ? "text-red-500" : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
                      </motion.div>
                      <span className="text-sm font-medium">
                        {isLiked ? post.likes + 1 : post.likes}
                      </span>
                    </button>

                    <button className="flex items-center gap-2 group">
                      <MessageCircle className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>

                    <button className="flex items-center gap-2 group">
                      <Share2 className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-sm font-medium">{post.shares}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => toggleSave(post.id)}
                    className={`transition-colors ${
                      isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Bookmark className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* Post Content */}
                <div className="px-6">
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">{post.creator.username}</span>{" "}
                    {post.content}
                  </p>
                </div>

                {/* Talents */}
                <div className="px-6 flex gap-2">
                  {post.creator.talents.slice(0, 2).map((talent) => (
                    <Badge
                      key={talent}
                      variant="secondary"
                      className="text-xs bg-muted border-0"
                    >
                      {talent}
                    </Badge>
                  ))}
                </div>

                {/* Divider */}
                {index < mockPosts.length - 1 && (
                  <div className="h-px bg-border mx-6 mt-6" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Load More */}
        <div className="px-6 py-8 flex justify-center">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Load more posts
          </button>
        </div>
      </div>

      <BottomNav />
    </MobileContainer>
  );
}