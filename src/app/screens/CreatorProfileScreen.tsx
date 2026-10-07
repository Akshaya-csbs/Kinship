import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  MoreHorizontal,
  Sparkles,
  MapPin,
  Award,
  Users,
  Grid3x3,
  Film,
  MessageCircle,
  Handshake,
  Link as LinkIcon,
  Settings,
  Loader2,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { MobileContainer } from "../components/MobileContainer";
import BottomNav from "../components/BottomNav";
import PostCard from "../components/PostCard";
import CommentsDialog from "../components/CommentsDialog";
import { shareLink } from "../components/shareLink";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";

const inputClass = "w-full bg-muted/50 border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function InviteDialog({ creator, open, onOpenChange }: { creator: any; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [project, setProject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.trim()) {
      toast.error("Name the project you want to collaborate on");
      return;
    }
    setSending(true);
    try {
      await api.sendCollaborationRequest(creator.id, project.trim(), message.trim());
      toast.success(`Collaboration request sent to ${creator.name}`);
      setProject("");
      setMessage("");
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite {creator.name} to collaborate</DialogTitle>
          <DialogDescription>They will see your request on their Collaborations page.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <input value={project} onChange={(e) => setProject(e.target.value)} maxLength={255} placeholder="Project name" className={inputClass} />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell them what you have in mind"
            className={`${inputClass} min-h-24`}
          />
          <Button type="submit" disabled={sending} className="w-full h-11 rounded-2xl bg-gradient-to-r from-primary to-secondary">
            {sending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Send request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreatorProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profileId = id === "me" || !id ? api.getCurrentUser()?.id : Number(id);

  const [activeTab, setActiveTab] = useState<"grid" | "video">("grid");
  const [creator, setCreator] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [openPost, setOpenPost] = useState<any | null>(null);
  const [commentsFor, setCommentsFor] = useState<any | null>(null);

  const load = useCallback(async () => {
    if (!profileId || !Number.isFinite(profileId)) {
      setError("Profile not found");
      return;
    }
    setError(null);
    try {
      const [profile, creatorPosts] = await Promise.all([api.getCreator(profileId), api.getCreatorPosts(profileId)]);
      setCreator(profile);
      setPosts(creatorPosts);
      setEditName(profile.name);
      setEditBio(profile.bio ?? "");
      setEditLocation(profile.location ?? "");
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [profileId]);

  useEffect(() => {
    setCreator(null);
    load();
  }, [load]);

  if (error) {
    return (
      <MobileContainer>
        <div className="p-8 text-center space-y-4">
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go back
          </Button>
        </div>
      </MobileContainer>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isMe = creator.isMe;
  const visiblePosts = activeTab === "video" ? posts.filter((p) => p.type === "video") : posts;

  const toggleFollow = async () => {
    setFollowBusy(true);
    try {
      const result = await api.followUser(creator.id);
      setCreator({ ...creator, isFollowing: result.following, followers: result.followers });
      toast.success(result.following ? `You are now following ${creator.name}` : `Unfollowed ${creator.name}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setFollowBusy(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile({ name: editName, bio: editBio, location: editLocation });
      setCreator({ ...creator, ...updated, isMe: true });
      setIsEditing(false);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const shareProfile = () => shareLink(`${creator.name} on Kinship`, `${window.location.origin}/profile/${creator.id}`);

  const updatePost = (updated: any) => {
    setPosts((list) => list.map((p) => (p.id === updated.id ? updated : p)));
    setOpenPost((current: any) => (current?.id === updated.id ? updated : current));
  };

  return (
    <MobileContainer>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-accent rounded-xl transition-colors" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold">{creator.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-accent rounded-xl transition-colors" aria-label="More">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={shareProfile}>
                  <LinkIcon className="w-4 h-4" /> Share profile
                </DropdownMenuItem>
                {isMe ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/talents")}>
                      <Sparkles className="w-4 h-4" /> Edit talents
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="w-4 h-4" /> Settings
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate(`/messages/${creator.id}`)}>
                      <MessageCircle className="w-4 h-4" /> Send message
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setInviting(true)}>
                      <Handshake className="w-4 h-4" /> Invite to collaborate
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Profile Header */}
        <div className="px-6 pt-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl overflow-hidden ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
              </div>
              {creator.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-xl font-bold">{formatCount(creator.followers)}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{formatCount(creator.following)}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{creator.postCount}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-3">
            {isEditing ? (
              <div className="space-y-2">
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={100} placeholder="Name" className={`${inputClass} font-bold`} />
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={500}
                  placeholder="Bio"
                  className={`${inputClass} leading-relaxed min-h-[80px]`}
                />
                <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} maxLength={100} placeholder="Location" className={inputClass} />
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-bold mb-1">{creator.name}</h2>
                  <p className="text-sm text-muted-foreground">{creator.username}</p>
                </div>
                <p className="text-sm leading-relaxed">{creator.bio}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{creator.location}</span>
                </div>
              </>
            )}

            {/* Talents */}
            <div className="flex flex-wrap gap-2">
              {creator.talents.map((talent: string) => (
                <Badge key={talent} className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  {talent}
                </Badge>
              ))}
              {isMe && (
                <button onClick={() => navigate("/talents")} className="text-xs text-primary underline-offset-2 hover:underline">
                  {creator.talents.length ? "Edit talents" : "Add talents"}
                </button>
              )}
            </div>

            {/* Achievements */}
            {creator.achievements?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Achievements</span>
                </div>
                <div className="space-y-1">
                  {creator.achievements.map((achievement: string) => (
                    <div key={achievement} className="text-sm px-3 py-2 rounded-xl bg-muted/50 border border-border/50">
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save Profile
                </Button>
                <Button
                  onClick={() => {
                    setEditName(creator.name);
                    setEditBio(creator.bio ?? "");
                    setEditLocation(creator.location ?? "");
                    setIsEditing(false);
                  }}
                  variant="outline"
                  className="flex-1 h-11 rounded-2xl border-border hover:bg-accent"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {isMe ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={toggleFollow}
                      disabled={followBusy}
                      className={`flex-1 h-11 rounded-2xl transition-all ${
                        creator.isFollowing
                          ? "bg-muted text-foreground hover:bg-muted/80"
                          : "bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50"
                      }`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {creator.isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button
                      onClick={() => navigate(`/messages/${creator.id}`)}
                      variant="outline"
                      className="h-11 px-4 rounded-2xl border-border hover:bg-accent"
                      aria-label="Message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}

                <Button onClick={shareProfile} variant="outline" className="h-11 px-6 rounded-2xl border-border hover:bg-accent">
                  Share
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab("grid")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
                activeTab === "grid" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
              <span className="text-sm font-medium">Posts</span>
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
                activeTab === "video" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              }`}
            >
              <Film className="w-5 h-5" />
              <span className="text-sm font-medium">Videos</span>
            </button>
          </div>
        </div>

        {/* Portfolio Grid */}
        {visiblePosts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">
            {activeTab === "video" ? "No videos yet." : isMe ? "You haven't posted yet. Tap + on the Home feed." : "No posts yet."}
          </p>
        ) : (
          <div className="p-1 grid grid-cols-3 gap-1">
            {visiblePosts.map((post, index) => (
              <motion.button
                key={post.id}
                onClick={() => setOpenPost(post)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(index, 9) * 0.05 }}
                className="relative aspect-square overflow-hidden bg-muted hover:opacity-90 transition-opacity"
              >
                <img src={post.media} alt={post.content} className="w-full h-full object-cover" />
                {post.type === "video" && <Play className="absolute top-2 right-2 w-4 h-4 text-white drop-shadow" />}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!openPost} onOpenChange={(open) => !open && setOpenPost(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Post</DialogTitle>
            <DialogDescription>{openPost?.content}</DialogDescription>
          </DialogHeader>
          {openPost && (
            <PostCard
              post={openPost}
              onChange={updatePost}
              onDeleted={(postId) => {
                setPosts((list) => list.filter((p) => p.id !== postId));
                setCreator({ ...creator, postCount: creator.postCount - 1 });
                setOpenPost(null);
              }}
              onOpenComments={(post) => {
                setOpenPost(null);
                setCommentsFor(post);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <CommentsDialog
        post={commentsFor}
        onClose={() => setCommentsFor(null)}
        onCommentAdded={(postId) =>
          setPosts((list) => list.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)))
        }
      />
      {!isMe && <InviteDialog creator={creator} open={inviting} onOpenChange={setInviting} />}

      <BottomNav />
    </MobileContainer>
  );
}
