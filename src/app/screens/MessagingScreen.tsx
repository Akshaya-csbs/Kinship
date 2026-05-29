import { motion } from "motion/react";
import { Search, Send, Paperclip, Mic, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";

const conversations = [
  {
    id: 1,
    user: {
      name: "Maya Rodriguez",
      avatar: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
      talent: "🎨 Visual Artist",
    },
    lastMessage: "That sounds perfect! When can we start?",
    time: "5m ago",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    user: {
      name: "Jordan Chen",
      avatar: "https://images.unsplash.com/photo-1547153760-18fc86324498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
      talent: "💃 Choreographer",
    },
    lastMessage: "I've sent you the draft choreography",
    time: "1h ago",
    unread: 0,
    online: true,
  },
  {
    id: 3,
    user: {
      name: "Sarah Kim",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
      talent: "📸 Photographer",
    },
    lastMessage: "The photos came out amazing!",
    time: "3h ago",
    unread: 0,
    online: false,
  },
  {
    id: 4,
    user: {
      name: "David Torres",
      avatar: "https://images.unsplash.com/photo-1618673747378-7e0d3561371a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
      talent: "🎵 Producer",
    },
    lastMessage: "Let's schedule a studio session",
    time: "1d ago",
    unread: 0,
    online: false,
  },
];

export default function MessagingScreen() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Messages</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-secondary/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Conversations list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {conversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard
                onClick={() => setSelectedConversation(conversation.id)}
                className="p-4 cursor-pointer hover:border-primary/50 transition-all"
              >
                <div className="flex gap-3">
                  <div className="relative">
                    <img
                      src={conversation.user.avatar}
                      alt={conversation.user.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full ring-2 ring-card" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold text-foreground">{conversation.user.name}</h3>
                        <p className="text-xs text-muted-foreground">{conversation.user.talent}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {conversation.time}
                        </span>
                        {conversation.unread > 0 && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {conversation.unread}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground/70 truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty state when no conversation selected */}
        {selectedConversation === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Your Messages</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Connect with creators, discuss collaborations, and build meaningful relationships
            </p>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
