import { motion } from "motion/react";
import { Heart, MessageCircle, UserPlus, Users, Award, Sparkles, Clock } from "lucide-react";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";

const notifications = [
  {
    id: 1,
    type: "like",
    user: {
      name: "Maya Rodriguez",
      avatar: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    },
    action: "liked your post",
    content: "New abstract piece exploring emotion",
    time: "5m ago",
    read: false,
  },
  {
    id: 2,
    type: "collaboration",
    user: {
      name: "Jordan Chen",
      avatar: "https://images.unsplash.com/photo-1547153760-18fc86324498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    },
    action: "invited you to collaborate on",
    content: "Summer Vibes EP",
    time: "1h ago",
    read: false,
  },
  {
    id: 3,
    type: "follow",
    user: {
      name: "Sarah Kim",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    },
    action: "started following you",
    time: "2h ago",
    read: false,
  },
  {
    id: 4,
    type: "comment",
    user: {
      name: "David Torres",
      avatar: "https://images.unsplash.com/photo-1618673747378-7e0d3561371a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    },
    action: "commented on your post",
    content: "This is incredible! 🔥",
    time: "3h ago",
    read: true,
  },
  {
    id: 5,
    type: "achievement",
    action: "You've reached 10,000 followers!",
    content: "Keep creating amazing content",
    time: "1d ago",
    read: true,
  },
  {
    id: 6,
    type: "like",
    user: {
      name: "Emma Zhang",
      avatar: "https://images.unsplash.com/photo-1660092626225-f291ab2970b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    },
    action: "and 23 others liked your collaboration",
    content: "Urban Photography Series",
    time: "1d ago",
    read: true,
  },
  {
    id: 7,
    type: "follow",
    user: {
      name: "Marcus Lee",
      avatar: "https://images.unsplash.com/photo-1536924430914-91f9e2041b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    },
    action: "started following you",
    time: "2d ago",
    read: true,
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="w-5 h-5 text-red-500" />;
    case "comment":
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case "follow":
      return <UserPlus className="w-5 h-5 text-green-500" />;
    case "collaboration":
      return <Users className="w-5 h-5 text-purple-500" />;
    case "achievement":
      return <Award className="w-5 h-5 text-yellow-500" />;
    default:
      return <Sparkles className="w-5 h-5 text-primary" />;
  }
};

export default function NotificationsScreen() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">
              Mark all as read
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Notifications list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard
                className={`p-4 cursor-pointer hover:border-primary/50 transition-all ${
                  !notification.read ? "ring-2 ring-primary/20" : ""
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon or avatar */}
                  {notification.user ? (
                    <div className="relative flex-shrink-0">
                      <img
                        src={notification.user.avatar}
                        alt={notification.user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-card rounded-full flex items-center justify-center ring-2 ring-card">
                        {getIcon(notification.type)}
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground mb-1">
                      {notification.user && (
                        <span className="font-semibold">{notification.user.name} </span>
                      )}
                      <span className="text-foreground/80">{notification.action}</span>
                    </p>
                    {notification.content && (
                      <p className="text-sm text-muted-foreground mb-1 truncate">
                        {notification.content}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{notification.time}</span>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty state */}
        {notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">You're all caught up!</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              No new notifications right now. Keep creating and connecting!
            </p>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
