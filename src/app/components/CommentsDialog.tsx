import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";

interface CommentsDialogProps {
  post: any | null;
  onClose: () => void;
  onCommentAdded: (postId: number) => void;
}

export default function CommentsDialog({ post, onClose, onCommentAdded }: CommentsDialogProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!post) return;
    setText("");
    setLoading(true);
    api
      .getComments(post.id)
      .then(setComments)
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [post]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !text.trim() || sending) return;
    setSending(true);
    try {
      const comment = await api.addComment(post.id, text.trim());
      setComments((prev) => [...prev, comment]);
      setText("");
      onCommentAdded(post.id);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription className="line-clamp-2 break-words">{post?.content}</DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
          {loading && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Be the first!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <img src={c.author.image} alt={c.author.name} className="w-8 h-8 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{c.author.name}</span>{" "}
                  <span className="text-foreground/90 break-words">{c.content}</span>
                </p>
                <p className="text-xs text-muted-foreground">{c.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder="Add a comment..."
            className="flex-1 bg-secondary/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="px-4 rounded-xl bg-primary text-white disabled:opacity-50 flex items-center"
            aria-label="Send comment"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
