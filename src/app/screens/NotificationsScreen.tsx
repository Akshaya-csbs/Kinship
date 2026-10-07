import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Heart, MessageCircle, UserPlus, Users, Award, Sparkles, Clock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";

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
    case "message":
      return <Mail className="w-5 h-5 text-sky-500" />;
    default:
      return <Sparkles className="w-5 h-5 text-primary" />;
  }
};

/** Where tapping a notification takes the user. */
const targetFor = (n: any): string | null => {
  switch (n.type) {
    case "like":
    case "comment":
      return "/profile/me";
    case "follow":
      return n.user ? `/profile/${n.user.id}` : null;
    case "collaboration":
      return "/collaborate";
    case "message":
      return n.user ? `/messages/${n.user.id}` : "/messages";
    default:
      return null;
  }
};

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    api
      .getNotifications()
      .then((data) => setNotifications(data.items))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    if (unreadCount === 0) {
      toast.info("You're all caught up");
      return;
    }
    try {
      await api.markAllNotificationsRead();
      setNotifications((list) => list.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const open = async (notification: any) => {
    if (!notification.read) {
      setNotifications((list) => list.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
      api.markNotificationRead(notification.id).catch((err) => toast.error(errorMessage(err)));
    }
    const target = targetFor(notification);
    if (target) navigate(target);
  };

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
            <button onClick={markAllRead} className="text-sm text-primary hover:text-primary/80 transition-colors">
              Mark all as read
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

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
              transition={{ delay: Math.min(index, 8) * 0.05 }}
            >
              <GlassCard
                onClick={() => open(notification)}
                className={`p-4 cursor-pointer hover:border-primary/50 transition-all ${
                  !notification.read ? "ring-2 ring-primary/20" : ""
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon or avatar */}
                  {notification.user ? (
                    <div className="relative flex-shrink-0">
                      <img
                        src={notification.user.image}
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
                      <span>{notification.timestamp}</span>
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
        {!loading && notifications.length === 0 && (
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
