import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  MoreVertical,
  Sparkles,
  TrendingUp,
  Users,
  Settings,
  Briefcase,
  Cpu,
  LogOut,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import FloatingActionButton from "../components/FloatingActionButton";
import PostCard from "../components/PostCard";
import CommentsDialog from "../components/CommentsDialog";
import CreatePostDialog from "../components/CreatePostDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";

const trendingCollaborations = [
  { title: "Music Video Project", talents: ["🎬", "🎵"], members: 3 },
  { title: "Art Exhibition", talents: ["🎨", "📸"], members: 8 },
  { title: "Dance Film", talents: ["💃", "🎥"], members: 4 },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [commentsFor, setCommentsFor] = useState<any | null>(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      setFeedPosts(await api.getFeedPostsAsync());
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const updatePost = (updated: any) => setFeedPosts((posts) => posts.map((p) => (p.id === updated.id ? updated : p)));
  const removePost = (id: number) => setFeedPosts((posts) => posts.filter((p) => p.id !== id));
  const incrementComments = (id: number) =>
    setFeedPosts((posts) => posts.map((p) => (p.id === id ? { ...p, comments: p.comments + 1 } : p)));

  const handleLogout = async () => {
    await api.logout().catch(() => undefined);
    toast.success("Signed out");
    navigate("/auth", { replace: true });
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
              onClick={loadFeed}
              className="p-2 hover:bg-secondary rounded-xl transition-colors"
              aria-label="Refresh feed"
            >
              <RefreshCw className={`w-5 h-5 text-foreground ${loading ? "animate-spin" : ""}`} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-secondary rounded-xl transition-colors" aria-label="Menu">
                  <MoreVertical className="w-6 h-6 text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/opportunities")}>
                  <Briefcase className="w-4 h-4" /> Opportunities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/collaborate")}>
                  <Users className="w-4 h-4" /> Collaborations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/system")}>
                  <Cpu className="w-4 h-4" /> Java backend status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Trending Collaborations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Trending Collaborations</h2>
            </div>
            <button
              onClick={() => navigate("/opportunities")}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Opportunities
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {trendingCollaborations.map((collab, index) => (
              <GlassCard
                key={index}
                onClick={() => navigate("/collaborate")}
                className="flex-shrink-0 w-64 p-4 cursor-pointer hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  {collab.talents.map((talent, i) => (
                    <span key={i} className="text-2xl">
                      {talent}
                    </span>
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
          {loading && feedPosts.length === 0 && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && feedPosts.length === 0 && (
            <GlassCard className="p-8 text-center">
              <p className="text-foreground font-medium mb-2">No posts yet</p>
              <p className="text-sm text-muted-foreground mb-4">Be the first to share something with the community.</p>
              <button
                onClick={() => setCreating(true)}
                className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg"
              >
                Create a post
              </button>
            </GlassCard>
          )}
          {feedPosts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              index={index}
              onChange={updatePost}
              onDeleted={removePost}
              onOpenComments={setCommentsFor}
            />
          ))}
        </div>
      </div>

      <BottomNav />
      <FloatingActionButton onClick={() => setCreating(true)} />

      <CreatePostDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={(post) => setFeedPosts((posts) => [post, ...posts])}
      />
      <CommentsDialog post={commentsFor} onClose={() => setCommentsFor(null)} onCommentAdded={incrementComments} />
    </div>
  );
}
