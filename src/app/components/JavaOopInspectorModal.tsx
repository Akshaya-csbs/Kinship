import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Cpu, Layers, AlertTriangle, Play, CheckCircle, Code, Box, RefreshCw } from "lucide-react";
import { KinshipPlatformFacade } from "../core/services/KinshipPlatformFacade";
import { LoggedException } from "../core/exceptions/GlobalExceptionHandler";
import { TaskRecord } from "../core/threading/ThreadPoolExecutor";

interface JavaOopInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JavaOopInspectorModal({ isOpen, onClose }: JavaOopInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<"oop" | "collections" | "exceptions" | "threading" | "javacode">("oop");
  const [exceptions, setExceptions] = useState<LoggedException[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [polyOutput, setPolyOutput] = useState<string[]>([]);

  const facade = KinshipPlatformFacade.getInstance();

  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to Exception logs
    const unsubEx = facade.getExceptionHandler().subscribe((logs) => {
      setExceptions([...logs]);
    });

    // Subscribe to ThreadPool tasks
    const unsubTasks = facade.getThreadPool().subscribe((taskList) => {
      setTasks([...taskList]);
    });

    // Run Polymorphism test
    runPolymorphismTest();

    return () => {
      unsubEx();
      unsubTasks();
    };
  }, [isOpen]);

  const runPolymorphismTest = () => {
    const posts = facade.getPostRepository().findAll();
    const opps = facade.getOpportunityRepository().findAll();
    const outputs: string[] = [];

    outputs.push("=== POLYMORPHIC CALL: post.getDisplaySummary() ===");
    for (let i = 0; i < posts.size(); i++) {
      outputs.push(posts.get(i).getDisplaySummary());
    }

    outputs.push("\n=== POLYMORPHIC CALL: opportunity.getDisplaySummary() ===");
    for (let i = 0; i < opps.size(); i++) {
      outputs.push(opps.get(i).getDisplaySummary());
    }

    setPolyOutput(outputs);
  };

  const handleTriggerException = (type: "NOT_FOUND" | "VALIDATION" | "GENERIC") => {
    facade.triggerDemoException(type);
  };

  const handleSpawnThreadTask = () => {
    facade.triggerDemoThreadTask();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                ☕
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Java OOP & Architecture Inspector
                  <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                    Active Engine
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Interactive runtime visualizer for Java OOP concepts, Collection Frameworks, Threads, and Exceptions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-neutral-950/50 px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("oop")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "oop"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              OOP & Polymorphism
            </button>
            <button
              onClick={() => setActiveTab("collections")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "collections"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Box className="w-4 h-4" />
              Collections Framework
            </button>
            <button
              onClick={() => setActiveTab("exceptions")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "exceptions"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Exception Handling ({exceptions.length})
            </button>
            <button
              onClick={() => setActiveTab("threading")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "threading"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Cpu className="w-4 h-4" />
              Multithreading Pool ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab("javacode")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "javacode"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Code className="w-4 h-4" />
              Java Source Code
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: OOP & POLYMORPHISM */}
            {activeTab === "oop" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-800/50 border border-white/5 space-y-2">
                    <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Class & Object Hierarchy
                    </h3>
                    <ul className="text-xs space-y-1.5 text-neutral-300 font-mono">
                      <li>• AbstractEntity (Abstract Base)</li>
                      <li className="pl-3">• User (Abstract Class)</li>
                      <li className="pl-6 text-emerald-400">• CreatorUser (Subclass)</li>
                      <li className="pl-3">• Post (Abstract Class)</li>
                      <li className="pl-6 text-emerald-400">• ImagePost (Subclass)</li>
                      <li className="pl-6 text-emerald-400">• VideoPost (Subclass)</li>
                      <li className="pl-6 text-emerald-400">• CollaborationPost (Subclass)</li>
                      <li className="pl-3">• Opportunity (Abstract Class)</li>
                      <li className="pl-6 text-emerald-400">• EventOpportunity (Subclass)</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-800/50 border border-white/5 space-y-2">
                    <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                      🛡️ Interfaces & Encapsulation
                    </h3>
                    <div className="text-xs text-neutral-300 space-y-2">
                      <p>
                        <strong className="text-white">Interfaces implemented:</strong> <code className="text-purple-400">ITalentSearchable</code>, <code className="text-purple-400">INotifiable</code>, <code className="text-purple-400">IRepository&lt;T&gt;</code>, <code className="text-purple-400">IRunnable</code>
                      </p>
                      <p>
                        <strong className="text-white">Encapsulation:</strong> Private properties (<code className="text-amber-300">private _followers</code>, <code className="text-amber-300">private _likes</code>) accessed safely through getters and controlled mutation methods.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      🎭 Polymorphism Live Output (Dynamic Method Dispatch)
                    </h3>
                    <button
                      onClick={runPolymorphismTest}
                      className="px-3 py-1 text-xs bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-run
                    </button>
                  </div>
                  <pre className="p-3 bg-black/60 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto max-h-48">
                    {polyOutput.join("\n")}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 2: COLLECTIONS FRAMEWORK */}
            {activeTab === "collections" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-800/50 border border-white/5">
                    <h4 className="font-semibold text-amber-400 text-sm mb-1">ArrayList&lt;T&gt;</h4>
                    <p className="text-xs text-neutral-400 mb-2">Dynamic array implementation</p>
                    <div className="text-xl font-bold text-white">
                      {facade.getPostRepository().findAll().size()} <span className="text-xs font-normal text-neutral-400">elements</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-800/50 border border-white/5">
                    <h4 className="font-semibold text-amber-400 text-sm mb-1">HashMap&lt;K, V&gt;</h4>
                    <p className="text-xs text-neutral-400 mb-2">Hash-table bucket chaining</p>
                    <div className="text-xl font-bold text-white">
                      {facade.getCreatorRepository().count()} <span className="text-xs font-normal text-neutral-400">entries</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-800/50 border border-white/5">
                    <h4 className="font-semibold text-amber-400 text-sm mb-1">PriorityQueue&lt;T&gt;</h4>
                    <p className="text-xs text-neutral-400 mb-2">Max-Heap sorted by likes</p>
                    <div className="text-xl font-bold text-white">
                      Active <span className="text-xs font-normal text-neutral-400">Feed Sorter</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-3">
                  <h4 className="text-sm font-semibold text-white">Live HashMap Repository Inspection</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-neutral-400">
                          <th className="py-2 px-3">ID</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3">Talents</th>
                          <th className="py-2 px-3">Followers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facade.getCreatorsJSON().slice(0, 5).map((creator: any) => (
                          <tr key={creator.id} className="border-b border-white/5 text-neutral-200">
                            <td className="py-2 px-3 font-mono text-amber-400">#{creator.id}</td>
                            <td className="py-2 px-3 font-medium">{creator.name}</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px]">CreatorUser</span></td>
                            <td className="py-2 px-3">{creator.talents.join(", ")}</td>
                            <td className="py-2 px-3">{creator.followers.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: EXCEPTION HANDLING */}
            {activeTab === "exceptions" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-800/50 border border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Trigger Java Exception Demo</h3>
                    <p className="text-xs text-neutral-400">Test try-catch exception hierarchy dispatching</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTriggerException("NOT_FOUND")}
                      className="px-3 py-1.5 text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg border border-red-500/30 transition-colors"
                    >
                      EntityNotFoundException
                    </button>
                    <button
                      onClick={() => handleTriggerException("VALIDATION")}
                      className="px-3 py-1.5 text-xs bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-lg border border-amber-500/30 transition-colors"
                    >
                      ValidationException
                    </button>
                    <button
                      onClick={() => handleTriggerException("GENERIC")}
                      className="px-3 py-1.5 text-xs bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg border border-purple-500/30 transition-colors"
                    >
                      KinshipException
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">GlobalExceptionHandler Log Stream</h4>
                    <button
                      onClick={() => facade.getExceptionHandler().clearLogs()}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Clear Logs
                    </button>
                  </div>

                  {exceptions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-500">
                      No exceptions caught yet. Click a button above to test exception catching.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {exceptions.map((ex) => (
                        <div key={ex.id} className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-xs space-y-1">
                          <div className="flex items-center justify-between text-red-400 font-semibold">
                            <span>{ex.name} [{ex.code}]</span>
                            <span className="text-neutral-500 text-[10px]">{ex.timestamp}</span>
                          </div>
                          <p className="text-neutral-300 font-mono">{ex.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: MULTITHREADING POOL */}
            {activeTab === "threading" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-800/50 border border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">ThreadPoolExecutor Worker Pool</h3>
                    <p className="text-xs text-neutral-400">4 Core Parallel Threads with Priority Queue</p>
                  </div>
                  <button
                    onClick={handleSpawnThreadTask}
                    className="px-4 py-2 text-xs bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> Dispatch Worker Task
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-3">
                  <h4 className="text-sm font-semibold text-white">Active & Recent Thread Tasks</h4>
                  {tasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-500">
                      No tasks dispatched yet. Click "Dispatch Worker Task" to run background threads.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div key={task.id} className="p-3 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{task.name}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">({task.id})</span>
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              Thread: <code className="text-amber-400">{task.threadName}</code> · Submitted: {task.submittedAt}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                              task.status === "COMPLETED"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : task.status === "RUNNING"
                                ? "bg-amber-500/20 text-amber-400 animate-pulse"
                                : "bg-neutral-800 text-neutral-400"
                            }`}>
                              {task.status}
                            </span>
                            {task.status === "COMPLETED" && (
                              <span className="text-neutral-500 font-mono text-[10px]">{task.executionMs}ms</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: JAVA SOURCE CODE */}
            {activeTab === "javacode" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-800/50 border border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-1">Java Source Code Structure</h3>
                  <p className="text-xs text-neutral-400">
                    All core domain models, interfaces, exception classes, collection frameworks, and multithreading modules are compiled and included under <code className="text-amber-400">java/com/kinship/app/</code> in this repository.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-3 font-mono text-xs text-neutral-300">
                  <div className="text-amber-400 font-semibold">📁 java/com/kinship/app/</div>
                  <div className="pl-4 space-y-1">
                    <div>├── 📁 models/ (AbstractEntity.java, User.java, CreatorUser.java, Post.java, ImagePost.java, VideoPost.java)</div>
                    <div>├── 📁 interfaces/ (ITalentSearchable.java, INotifiable.java, IRepository.java)</div>
                    <div>├── 📁 exceptions/ (KinshipException.java, EntityNotFoundException.java, ValidationException.java)</div>
                    <div>└── 📁 services/ (KinshipPlatformFacade.java)</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Kinship Java OOP Engine Status: Fully Operational</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
