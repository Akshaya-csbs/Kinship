import { motion } from "motion/react";
import { Users, Plus, Search, Music, Palette, Film, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router";
import GlassCard from "../components/GlassCard";

const collaborationRequests = [
  {
    id: 1,
    from: {
      name: "Maya Rodriguez",
      avatar: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
      talent: "🎨 Visual Artist",
    },
    project: "Album Cover Design",
    message: "Hey! I love your music style. Would you be interested in collaborating on album artwork?",
    time: "2h ago",
    status: "pending",
  },
  {
    id: 2,
    from: {
      name: "Jordan Chen",
      avatar: "https://images.unsplash.com/photo-1547153760-18fc86324498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
      talent: "💃 Choreographer",
    },
    project: "Music Video Choreography",
    message: "I'd love to create choreography for your new track. Let's make something amazing!",
    time: "1d ago",
    status: "pending",
  },
];

const activeCollaborations = [
  {
    id: 1,
    title: "Summer Vibes EP",
    members: [
      { name: "Alex", avatar: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100" },
      { name: "Sarah", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100" },
      { name: "David", avatar: "https://images.unsplash.com/photo-1618673747378-7e0d3561371a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100" },
    ],
    talents: [Music, Palette],
    progress: 65,
    deadline: "2 weeks",
  },
  {
    id: 2,
    title: "Urban Photography Series",
    members: [
      { name: "Emma", avatar: "https://images.unsplash.com/photo-1660092626225-f291ab2970b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100" },
      { name: "Marcus", avatar: "https://images.unsplash.com/photo-1536924430914-91f9e2041b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100" },
    ],
    talents: [Music, Film],
    progress: 40,
    deadline: "1 month",
  },
];

export default function CollaborationScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          Collaborations
        </h1>
        <p className="text-muted-foreground">Partner with talented creators</p>
      </motion.div>

      {/* Search and create */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3 mb-8"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search collaborations..."
            className="w-full bg-secondary/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          <span className="font-medium">Start New Collaboration</span>
        </button>
      </motion.div>

      {/* Collaboration Requests */}
      {collaborationRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Requests</h2>
          <div className="space-y-3">
            {collaborationRequests.map((request) => (
              <GlassCard key={request.id} className="p-4">
                <div className="flex gap-3 mb-3">
                  <img
                    src={request.from.avatar}
                    alt={request.from.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold text-foreground">{request.from.name}</h3>
                        <p className="text-sm text-muted-foreground">{request.from.talent}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{request.time}</span>
                    </div>
                    <h4 className="font-medium text-primary text-sm mb-2">{request.project}</h4>
                    <p className="text-sm text-foreground/80">{request.message}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-primary text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Accept</span>
                  </button>
                  <button className="flex-1 bg-secondary text-foreground py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Decline</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}

      {/* Active Collaborations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Projects</h2>
        <div className="space-y-4">
          {activeCollaborations.map((collab, index) => (
            <GlassCard
              key={collab.id}
              className="p-5 cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => {}}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{collab.title}</h3>
                  <div className="flex gap-2">
                    {collab.talents.map((TalentIcon, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center"
                      >
                        <TalentIcon className="w-4 h-4 text-white" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{collab.deadline}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-2">
                  {collab.members.map((member, i) => (
                    <img
                      key={i}
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-card"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {collab.members.length} members
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-primary font-medium">{collab.progress}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${collab.progress}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
