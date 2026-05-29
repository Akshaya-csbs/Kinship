import { motion } from "motion/react";
import { Settings, Share2, Grid3x3, Film, Award, Users, MapPin, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import TalentBadge from "../components/TalentBadge";

const profileData = {
  name: "Alex Morgan",
  username: "@alexmorgan",
  avatar: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  coverImage: "https://images.unsplash.com/photo-1576967402682-19976eb930f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  bio: "Musician & Producer | Creating sounds that move souls ✨ | Available for collaborations",
  location: "Los Angeles, CA",
  website: "alexmorgan.com",
  talents: [
    { icon: "🎵", label: "Music", gradient: "from-pink-500 to-rose-500" },
    { icon: "🎹", label: "Producer", gradient: "from-purple-500 to-pink-500" },
  ],
  stats: {
    followers: "45.2k",
    following: "892",
    collaborations: "23",
  },
  portfolio: [
    "https://images.unsplash.com/photo-1576967402682-19976eb930f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    "https://images.unsplash.com/photo-1628586431263-44040b966252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    "https://images.unsplash.com/photo-1547153760-18fc86324498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    "https://images.unsplash.com/photo-1613667013398-0ab87d27641b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  ],
  achievements: [
    { icon: "🏆", label: "Top Creator 2026" },
    { icon: "⭐", label: "5 Featured Projects" },
    { icon: "🎯", label: "10k+ Reach" },
  ],
};

export default function ProfileScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={profileData.coverImage}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        
        {/* Header buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 bg-black/50 backdrop-blur-xl rounded-xl text-white hover:bg-black/70 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="p-2 bg-black/50 backdrop-blur-xl rounded-xl text-white hover:bg-black/70 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-16">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-end gap-4 mb-4">
            <img
              src={profileData.avatar}
              alt={profileData.name}
              className="w-28 h-28 rounded-3xl object-cover ring-4 ring-background shadow-2xl"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{profileData.name}</h1>
              <p className="text-muted-foreground">{profileData.username}</p>
            </div>
          </div>

          {/* Talents */}
          <div className="flex flex-wrap gap-2 mb-4">
            {profileData.talents.map((talent, index) => (
              <TalentBadge
                key={index}
                icon={talent.icon}
                label={talent.label}
                gradient={talent.gradient}
              />
            ))}
          </div>

          {/* Bio */}
          <p className="text-foreground mb-3 leading-relaxed">{profileData.bio}</p>

          {/* Location and website */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{profileData.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <LinkIcon className="w-4 h-4" />
              <span className="text-primary">{profileData.website}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-6">
            <div>
              <div className="text-xl font-bold text-foreground">{profileData.stats.followers}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{profileData.stats.following}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{profileData.stats.collaborations}</div>
              <div className="text-sm text-muted-foreground">Collabs</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-medium hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
              Edit Profile
            </button>
            <button className="px-6 bg-secondary text-foreground py-3 rounded-xl font-medium hover:bg-secondary/80 transition-all active:scale-95">
              Share
            </button>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Achievements
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {profileData.achievements.map((achievement, index) => (
              <GlassCard key={index} className="flex-shrink-0 px-4 py-3">
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-sm text-foreground whitespace-nowrap">{achievement.label}</div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Content tabs */}
        <div className="border-b border-white/10 mb-6">
          <div className="flex gap-8">
            <button className="flex items-center gap-2 pb-3 border-b-2 border-primary text-primary">
              <Grid3x3 className="w-5 h-5" />
              <span className="font-medium">Portfolio</span>
            </button>
            <button className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">
              <Film className="w-5 h-5" />
              <span className="font-medium">Videos</span>
            </button>
            <button className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">
              <Users className="w-5 h-5" />
              <span className="font-medium">Collabs</span>
            </button>
          </div>
        </div>

        {/* Portfolio grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-2 mb-6"
        >
          {profileData.portfolio.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            >
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
