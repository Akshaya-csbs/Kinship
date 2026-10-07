import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Cpu, Database, AlertTriangle, Layers, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { api, errorMessage } from "../core/services/KinshipPlatformFacade";

const CONCEPTS = [
  {
    title: "Classes & Objects",
    detail: "AbstractEntity → User → CreatorUser, Post → ImagePost / VideoPost / CollabPost, Opportunity → Event / Gig / Collab / Competition / Workshop. Built with PostFactory / OpportunityFactory.",
  },
  {
    title: "Interfaces",
    detail: "IRepository<T, ID>, ITalentSearchable, INotifiable, JsonSerializable, Controller, and the functional interfaces ApiHandler and SqlFunction (used with lambdas).",
  },
  {
    title: "Exception Handling",
    detail: "Checked KinshipException hierarchy (Validation 400, Authentication 401, Authorization 403, EntityNotFound 404, Duplicate 409, Database 500) mapped to JSON by GlobalExceptionHandler; JDBC transactions roll back on failure.",
  },
  {
    title: "Multithreading",
    detail: "Fixed HTTP ThreadPoolExecutor, producer/consumer notification worker on a BlockingQueue, ScheduledExecutorService jobs, parallel talent matching with Callable/Future, CompletableFuture stats, Atomic counters and ConcurrentHashMap.",
  },
  {
    title: "JDBC + MySQL",
    detail: "mysql-connector-j, PreparedStatement everywhere, generated keys, batch inserts for seed data, joins, and commit/rollback transactions for likes, follows, comments and applications.",
  },
];

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-white/5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-right break-all">{String(value)}</span>
    </div>
  );
}

export default function SystemStatusScreen() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await api.getSystemStats());
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [load]);

  const t = stats?.threads;
  const db = stats?.database;

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-xl" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" /> Java Backend Status
          </h1>
          <button onClick={load} className="p-2 hover:bg-secondary rounded-xl" aria-label="Refresh">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
        <GlassCard className="p-4 flex items-center gap-3">
          {error ? <XCircle className="w-6 h-6 text-destructive" /> : <CheckCircle2 className="w-6 h-6 text-green-500" />}
          <div>
            <p className="font-semibold">{error ? "Backend unreachable" : stats?.server ?? "Connecting..."}</p>
            <p className="text-sm text-muted-foreground">
              {error ?? (stats ? `Java ${stats.javaVersion} · up ${stats.uptimeSeconds}s · ${stats.totalRequests} requests` : "")}
            </p>
          </div>
        </GlassCard>

        {db && (
          <GlassCard className="p-4">
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" /> MySQL (JDBC)
            </h2>
            <Stat label="Server" value={db.product} />
            <Stat label="Users / Posts / Opportunities" value={`${db.users} / ${db.posts} / ${db.opportunities}`} />
            <Stat label="JDBC connections opened" value={db.connectionsOpened} />
            <Stat label="Active sessions (cache)" value={stats.activeSessions} />
          </GlassCard>
        )}

        {t && (
          <GlassCard className="p-4">
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Threads
            </h2>
            <Stat label="HTTP pool (active / size)" value={`${t.httpActive} / ${t.httpPoolSize}`} />
            <Stat label="HTTP tasks completed" value={t.httpCompletedTasks} />
            <Stat label="This request served by" value={t.currentThread} />
            <Stat label={`${t.notificationWorker}`} value={t.notificationWorkerAlive ? "alive" : "stopped"} />
            <Stat label="Notification queue / delivered" value={`${t.notificationQueue} / ${t.notificationsDelivered}`} />
            <Stat label="Scheduled job runs" value={t.scheduledJobRuns} />
            <Stat label="JVM live threads" value={t.jvmLiveThreads} />
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Requests handled per HTTP thread</p>
              <div className="space-y-1">
                {Object.entries(t.requestsPerThread as Record<string, number>).map(([name, count]) => {
                  const max = Math.max(...(Object.values(t.requestsPerThread) as number[]));
                  return (
                    <div key={name} className="flex items-center gap-2 text-xs">
                      <span className="w-28 font-mono truncate">{name}</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                      <span className="w-8 text-right font-mono">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        )}

        {stats?.exceptions && (
          <GlassCard className="p-4">
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" /> Exceptions
            </h2>
            <Stat label="Failed requests (4xx/5xx)" value={stats.exceptions.failedRequests} />
            <Stat label="Server errors logged" value={stats.exceptions.handled} />
            {stats.exceptions.recent.map((line: string, i: number) => (
              <p key={i} className="text-xs font-mono text-muted-foreground mt-2 break-all">
                {line}
              </p>
            ))}
          </GlassCard>
        )}

        <h2 className="font-semibold pt-2">Java concepts used</h2>
        {CONCEPTS.map((c) => (
          <GlassCard key={c.title} className="p-4">
            <p className="font-medium mb-1">{c.title}</p>
            <p className="text-sm text-muted-foreground">{c.detail}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
