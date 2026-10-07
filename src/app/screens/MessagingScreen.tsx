import { motion } from "motion/react";
import { Search, Send, ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";

const POLL_MS = 5000;

function ChatThread({ userId }: { userId: number }) {
  const navigate = useNavigate();
  const me = api.getCurrentUser();
  const [other, setOther] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const thread = await api.getThread(userId);
      setOther(thread.user);
      setMessages(thread.messages);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }, [userId]);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const message = await api.sendMessage(userId, text.trim());
      setMessages((list) => [...list, message]);
      setText("");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/messages")} className="p-2 hover:bg-secondary rounded-xl" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {other ? (
            <button onClick={() => navigate(`/profile/${other.id}`)} className="flex items-center gap-3 text-left">
              <img src={other.image} alt={other.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h2 className="font-semibold text-foreground">{other.name}</h2>
                <p className="text-xs text-muted-foreground">{other.talents.join(" · ")}</p>
              </div>
            </button>
          ) : (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-3 overflow-y-auto">
        {other && messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Say hi to {other.name}!</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === me?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  mine ? "bg-gradient-to-r from-primary to-accent text-white rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"
                }`}
              >
                <p className="break-words whitespace-pre-wrap">{m.content}</p>
                <p className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-muted-foreground"}`}>{m.timestamp}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="sticky bottom-0 bg-background/90 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            placeholder="Write a message..."
            className="flex-1 bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="px-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white disabled:opacity-50"
            aria-label="Send"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}

function Inbox() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    const load = () =>
      api
        .getConversations()
        .then(setConversations)
        .catch((err) => toast.error(errorMessage(err)))
        .finally(() => setLoading(false));
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, []);

  // search creators to start a new conversation
  useEffect(() => {
    if (!query.trim()) {
      setPeople([]);
      return;
    }
    const timer = setTimeout(() => {
      api
        .getCreatorsAsync(query.trim())
        .then((list) => setPeople(list.filter((c) => !c.isMe)))
        .catch(() => setPeople([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const q = query.trim().toLowerCase();
  const visible = conversations.filter(
    (c) => !q || c.user.name.toLowerCase().includes(q) || c.lastMessage.content.toLowerCase().includes(q)
  );
  const newPeople = people.filter((p) => !conversations.some((c) => c.user.id === p.id));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Messages</h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations or creators..."
              className="w-full bg-secondary/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {visible.map((conversation, index) => (
            <motion.div
              key={conversation.user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 6) * 0.05 }}
            >
              <GlassCard
                onClick={() => navigate(`/messages/${conversation.user.id}`)}
                className="p-4 cursor-pointer hover:border-primary/50 transition-all"
              >
                <div className="flex gap-3">
                  <img
                    src={conversation.user.image}
                    alt={conversation.user.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold text-foreground">{conversation.user.name}</h3>
                        <p className="text-xs text-muted-foreground">{conversation.user.talents.join(" · ")}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {conversation.lastMessage.timestamp}
                        </span>
                        {conversation.unread > 0 && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">{conversation.unread}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm truncate ${conversation.unread > 0 ? "text-foreground font-medium" : "text-foreground/70"}`}>
                      {conversation.fromMe ? "You: " : ""}
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}

          {newPeople.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-muted-foreground pt-4">Start a new conversation</h2>
              {newPeople.map((person) => (
                <GlassCard
                  key={person.id}
                  onClick={() => navigate(`/messages/${person.id}`)}
                  className="p-3 cursor-pointer hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src={person.image} alt={person.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{person.name}</h3>
                      <p className="text-xs text-muted-foreground">{person.username}</p>
                    </div>
                    <Send className="w-4 h-4 text-primary" />
                  </div>
                </GlassCard>
              ))}
            </>
          )}
        </motion.div>

        {!loading && conversations.length === 0 && !q && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Your Messages</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-4">
              Connect with creators, discuss collaborations, and build meaningful relationships
            </p>
            <button
              onClick={() => navigate("/explore")}
              className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg"
            >
              Find creators
            </button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default function MessagingScreen() {
  const { userId } = useParams();
  const id = Number(userId);
  return userId && Number.isFinite(id) ? <ChatThread key={id} userId={id} /> : <Inbox />;
}
