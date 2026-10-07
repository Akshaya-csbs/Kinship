import { useState } from "react";
import { Image, Loader2, Users, Video } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";

const POST_TYPES = [
  { id: "image", label: "Photo", icon: Image },
  { id: "video", label: "Video", icon: Video },
  { id: "collab", label: "Collab", icon: Users },
] as const;

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (post: any) => void;
}

export default function CreatePostDialog({ open, onOpenChange, onCreated }: CreatePostDialogProps) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [type, setType] = useState<"image" | "video" | "collab">("image");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Write something for your post");
      return;
    }
    setSaving(true);
    try {
      const post = await api.createPost(content.trim(), type, mediaUrl.trim() || undefined);
      toast.success("Post published");
      onCreated(post);
      setContent("");
      setMediaUrl("");
      setType("image");
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
          <DialogDescription>Share your latest work with the Kinship community.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex gap-2">
            {POST_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition-all ${
                    type === t.id ? "bg-gradient-to-r from-primary to-accent text-white" : "bg-secondary text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            placeholder={type === "collab" ? "Who are you looking to collaborate with?" : "What are you working on?"}
            className="w-full min-h-28 bg-secondary/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="Image URL (optional, https://...)"
            className="w-full bg-secondary/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {mediaUrl.trim().startsWith("http") && (
            <img src={mediaUrl.trim()} alt="Preview" className="w-full max-h-48 object-cover rounded-xl" />
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
