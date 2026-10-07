import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Heart, MessageCircle, Share2, MoreVertical, Play, Trash2, User, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import GlassCard from "./GlassCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";
import { shareLink } from "./shareLink";

interface PostCardProps {
  post: any;
  index?: number;
  onChange: (post: any) => void;
  onDeleted: (postId: number) => void;
  onOpenComments: (post: any) => void;
}

export default function PostCard({ post, index = 0, onChange, onDeleted, onOpenComments }: PostCardProps) {
  const navigate = useNavigate();
  const isMine = api.getCurrentUser()?.id === post.creator.id;

  const toggleLike = async () => {
    // optimistic update, reverted if the server call fails
    const optimistic = { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) };
    onChange(optimistic);
    try {
      const result = await api.likePost(post.id);
      onChange({ ...optimistic, liked: result.liked, likes: result.likes });
    } catch (err) {
      onChange(post);
      toast.error(errorMessage(err));
    }
  };

  const share = async () => {
    const shared = await shareLink(`${post.creator.name} on Kinship`, `${window.location.origin}/profile/${post.creator.id}`);
    if (!shared) return;
    try {
      const result = await api.sharePost(post.id);
      onChange({ ...post, shares: result.shares });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.deletePost(post.id);
      onDeleted(post.id);
      toast.success("Post deleted");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/profile/${post.creator.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.info(url);
    }
  };

  const openProfile = () => navigate(`/profile/${post.creator.id}`);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 5) * 0.08 }}>
      <GlassCard className="overflow-hidden">
        {/* Post header */}
        <div className="p-4 flex items-center justify-between">
          <button onClick={openProfile} className="flex items-center gap-3 text-left">
            <img
              src={post.creator.image}
              alt={post.creator.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{post.creator.name}</h3>
                {post.badge && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-primary to-accent text-white text-xs rounded-full">
                    {post.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {(post.creator.talents ?? []).join(" · ")} {post.creator.talents?.length ? "·" : ""} {post.timestamp}
              </p>
            </div>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-secondary rounded-xl transition-colors" aria-label="Post options">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openProfile}>
                <User className="w-4 h-4" /> View profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}>
                <LinkIcon className="w-4 h-4" /> Copy link
              </DropdownMenuItem>
              {isMine && (
                <DropdownMenuItem variant="destructive" onClick={remove}>
                  <Trash2 className="w-4 h-4" /> Delete post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post media */}
        {post.media && (
          <div className="relative" onDoubleClick={() => !post.liked && toggleLike()}>
            <img src={post.media} alt="" className="w-full aspect-square object-cover" />
            {post.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Post actions */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 transition-colors ${post.liked ? "text-red-500" : "text-foreground hover:text-primary"}`}
              aria-label={post.liked ? "Unlike" : "Like"}
            >
              <motion.span whileTap={{ scale: 0.8 }} className="flex">
                <Heart className={`w-6 h-6 ${post.liked ? "fill-current" : ""}`} />
              </motion.span>
              <span className="font-medium">{post.likes.toLocaleString()}</span>
            </button>
            <button
              onClick={() => onOpenComments(post)}
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              aria-label="Comments"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium">{post.comments}</span>
            </button>
            <button
              onClick={share}
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors ml-auto"
              aria-label="Share"
            >
              <Share2 className="w-6 h-6" />
              <span className="font-medium">{post.shares}</span>
            </button>
          </div>

          <p className="text-foreground">
            <span className="font-semibold">{post.creator.name}</span>{" "}
            <span className="text-foreground/90">{post.caption}</span>
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
