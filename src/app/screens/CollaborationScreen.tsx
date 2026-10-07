import { motion } from "motion/react";
import { Users, Plus, Search, Clock, CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import GlassCard from "../components/GlassCard";
import BottomNav from "../components/BottomNav";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";

const TALENT_OPTIONS = ["Music", "Dance", "Art", "Photography", "Film", "Video", "Singing", "Writing"];

const inputClass =
  "w-full bg-secondary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";

function NewCollaborationDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [talents, setTalents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Give your project a title");
      return;
    }
    setSaving(true);
    try {
      await api.createCollaboration(title.trim(), description.trim(), talents, deadline.trim());
      toast.success("Collaboration created");
      setTitle("");
      setDescription("");
      setDeadline("");
      setTalents([]);
      onOpenChange(false);
      onCreated();
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
          <DialogTitle>Start a new collaboration</DialogTitle>
          <DialogDescription>Create a project, then invite creators from their profiles.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" maxLength={255} className={inputClass} />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you making?"
            className={`${inputClass} min-h-20`}
          />
          <input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="Deadline (e.g. 2 weeks)" className={inputClass} />
          <div className="flex flex-wrap gap-2">
            {TALENT_OPTIONS.map((t) => {
              const active = talents.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTalents((list) => (active ? list.filter((x) => x !== t) : [...list, t]))}
                  className={`px-3 py-1 rounded-lg text-sm ${active ? "bg-primary text-white" : "bg-secondary text-foreground"}`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Create
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProjectDialog({ project, onClose, onProgress }: { project: any | null; onClose: () => void; onProgress: (id: number, p: number) => void }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) setProgress(project.progress);
  }, [project]);

  const save = async () => {
    if (!project) return;
    setSaving(true);
    try {
      await api.updateCollaborationProgress(project.id, progress);
      onProgress(project.id, progress);
      toast.success("Progress updated");
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!project} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{project?.title}</DialogTitle>
          <DialogDescription>{project?.description || "No description"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Members</h4>
            <div className="space-y-2">
              {project?.members.map((m: any) => (
                <button
                  key={m.id}
                  onClick={() => navigate(`/profile/${m.id}`)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-secondary text-left"
                >
                  <img src={m.image} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm">{m.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{m.talents.join(" · ")}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Progress</span>
              <span className="text-primary font-medium">{progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save progress
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CollaborationScreen() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [openProject, setOpenProject] = useState<any | null>(null);
  const [responding, setResponding] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getCollaborations();
      setRequests(data.requests);
      setActive(data.active);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (request: any, accept: boolean) => {
    setResponding(request.id);
    try {
      await api.respondToCollaborationRequest(request.id, accept);
      toast.success(accept ? `You joined "${request.project}"` : "Request declined");
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setResponding(null);
    }
  };

  const q = query.trim().toLowerCase();
  const visibleRequests = requests.filter(
    (r) => !q || r.project.toLowerCase().includes(q) || r.from.name.toLowerCase().includes(q)
  );
  const visibleActive = active.filter(
    (c) => !q || c.title.toLowerCase().includes(q) || c.members.some((m: any) => m.name.toLowerCase().includes(q))
  );

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mb-2 hover:bg-secondary rounded-xl" aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          Collaborations
        </h1>
        <p className="text-muted-foreground">Partner with talented creators</p>
      </motion.div>

      <div className="max-w-2xl mx-auto">
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collaborations..."
              className="w-full bg-secondary/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            onClick={() => setCreating(true)}
            className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Start New Collaboration</span>
          </button>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Collaboration Requests */}
        {visibleRequests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Requests</h2>
            <div className="space-y-3">
              {visibleRequests.map((request) => (
                <GlassCard key={request.id} className="p-4">
                  <div className="flex gap-3 mb-3">
                    <button onClick={() => navigate(`/profile/${request.from.id}`)} className="flex-shrink-0">
                      <img
                        src={request.from.image}
                        alt={request.from.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                      />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="font-semibold text-foreground">{request.from.name}</h3>
                          <p className="text-sm text-muted-foreground">{request.from.talents.join(" · ")}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{request.timestamp}</span>
                      </div>
                      <h4 className="font-medium text-primary text-sm mb-2">{request.project}</h4>
                      <p className="text-sm text-foreground/80">{request.message}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(request, true)}
                      disabled={responding === request.id}
                      className="flex-1 bg-primary text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Accept</span>
                    </button>
                    <button
                      onClick={() => respond(request, false)}
                      disabled={responding === request.id}
                      className="flex-1 bg-secondary text-foreground py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors disabled:opacity-60"
                    >
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
        {!loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Active Projects</h2>
            {visibleActive.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                {q ? "No projects match your search." : "No active projects yet. Start one above!"}
              </p>
            )}
            <div className="space-y-4">
              {visibleActive.map((collab, index) => (
                <GlassCard
                  key={collab.id}
                  className="p-5 cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => setOpenProject(collab)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{collab.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        {collab.talents.map((talent: string) => (
                          <span key={talent} className="px-2 py-0.5 bg-gradient-to-br from-primary to-accent rounded-lg text-xs text-white">
                            {talent}
                          </span>
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
                      {collab.members.map((member: any) => (
                        <img
                          key={member.id}
                          src={member.image}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-card"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{collab.members.length} members</span>
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
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <NewCollaborationDialog open={creating} onOpenChange={setCreating} onCreated={load} />
      <ProjectDialog
        project={openProject}
        onClose={() => setOpenProject(null)}
        onProgress={(id, progress) => setActive((list) => list.map((c) => (c.id === id ? { ...c, progress } : c)))}
      />
      <BottomNav />
    </div>
  );
}
