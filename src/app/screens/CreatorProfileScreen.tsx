import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  MoreHorizontal,
  Sparkles,
  MapPin,
  Link as LinkIcon,
  Award,
  Users,
  Grid3x3,
  Film,
  MessageCircle,
} from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { KinshipPlatformFacade } from "../core/services/KinshipPlatformFacade";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export function CreatorProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"grid" | "video">("grid");
  const [creator, setCreator] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    KinshipPlatformFacade.getInstance().getCreatorsAsync().then(creators => {
      if (creators && creators.length > 0) {
        const found = creators.find((c: any) => c.id === Number(id)) || creators[0];
        setCreator(found);
        setEditName(found.name);
        setEditBio(found.bio);
      }
    });
  }, [id]);

  if (!creator) return <div className="p-8 text-center">Loading...</div>;

  // Mock portfolio images
  const portfolioImages = Array(9).fill(null).map((_, i) => creator.image);

  return (
    <MobileContainer>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-accent rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold">{creator.name}</span>
            <button className="p-2 hover:bg-accent rounded-xl transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="px-6 pt-6 space-y-6">
          {/* Avatar & Stats */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl overflow-hidden ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {creator.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-xl font-bold">{(creator.followers / 1000).toFixed(1)}k</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{creator.following}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">248</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-3">
            {isEditing ? (
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="w-full bg-muted/50 border border-border rounded-lg p-2 text-sm font-bold"
                />
                <textarea 
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)} 
                  className="w-full bg-muted/50 border border-border rounded-lg p-2 text-sm leading-relaxed min-h-[80px]"
                />
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-bold mb-1">{creator.name}</h2>
                  <p className="text-sm text-muted-foreground">{creator.username}</p>
                </div>
                <p className="text-sm leading-relaxed">{creator.bio}</p>
              </>
            )}

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{creator.location}</span>
            </div>

            {/* Talents */}
            <div className="flex flex-wrap gap-2">
              {creator.talents.map((talent) => (
                <Badge
                  key={talent}
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                >
                  {talent}
                </Badge>
              ))}
            </div>

            {/* Achievements */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Achievements</span>
              </div>
              <div className="space-y-1">
                {creator.achievements.map((achievement) => (
                  <div
                    key={achievement}
                    className="text-sm px-3 py-2 rounded-xl bg-muted/50 border border-border/50"
                  >
                    {achievement}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button
                  onClick={async () => {
                    const facade = KinshipPlatformFacade.getInstance();
                    const success = await facade.updateProfile(creator.id, editName, editBio);
                    if (success) {
                      setCreator({ ...creator, name: editName, bio: editBio });
                      setIsEditing(false);
                    }
                  }}
                  className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                >
                  Save Profile
                </Button>
                <Button
                  onClick={() => {
                    setEditName(creator.name);
                    setEditBio(creator.bio);
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
                {creator.id === 1 ? (
                  // Hardcoded user 1 as the current logged-in user to show Edit Profile
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    onClick={async () => {
                      const facade = KinshipPlatformFacade.getInstance();
                      await facade.followUser(creator.id);
                      setIsFollowing(true);
                      setCreator({ ...creator, followers: creator.followers + 1 });
                    }}
                    className={`flex-1 h-11 rounded-2xl transition-all ${
                      isFollowing
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50"
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="h-11 px-6 rounded-2xl border-border hover:bg-accent"
                >
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
                activeTab === "grid"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
              <span className="text-sm font-medium">Posts</span>
            </button>

            <button
              onClick={() => setActiveTab("video")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
                activeTab === "video"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              <Film className="w-5 h-5" />
              <span className="text-sm font-medium">Videos</span>
            </button>
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="p-1 grid grid-cols-3 gap-1">
          {portfolioImages.map((image, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="aspect-square overflow-hidden bg-muted hover:opacity-90 transition-opacity"
            >
              <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
      </div>

      <BottomNav />
    </MobileContainer>
  );
}
