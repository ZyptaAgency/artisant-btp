"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  CheckSquare,
  Trash2,
  Calendar,
  Flag,
  Plus,
  Pencil,
  X,
  Check,
  Square,
} from "lucide-react";

type TodoPriority = "HAUTE" | "MOYENNE" | "BASSE";

interface Todo {
  id: string;
  titre: string;
  description: string | null;
  completed: boolean;
  priority: TodoPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

type FilterTab = "all" | "pending" | "completed";

const PRIORITY_ORDER: Record<TodoPriority, number> = {
  HAUTE: 3,
  MOYENNE: 2,
  BASSE: 1,
};

const PRIORITY_CONFIG: Record<
  TodoPriority,
  { label: string; color: string; bg: string }
> = {
  HAUTE: {
    label: "Haute",
    color: "rgb(239, 68, 68)",
    bg: "rgba(239, 68, 68, 0.15)",
  },
  MOYENNE: {
    label: "Moyenne",
    color: "rgb(234, 179, 8)",
    bg: "rgba(234, 179, 8, 0.15)",
  },
  BASSE: {
    label: "Basse",
    color: "rgb(34, 197, 94)",
    bg: "rgba(34, 197, 94, 0.15)",
  },
};

function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
  });
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<TodoPriority>("MOYENNE");
  const [newDueDate, setNewDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<TodoPriority>("MOYENNE");
  const [editDueDate, setEditDueDate] = useState("");
  const [showAddOptions, setShowAddOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTodos(sortTodos(data));
    } catch {
      toast.error("Erreur lors du chargement des tâches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const addTodo = async () => {
    const title = newTitle.trim();
    if (!title) return;

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: title,
          priority: newPriority,
          dueDate: newDueDate || undefined,
        }),
      });

      if (!res.ok) throw new Error();
      const todo = await res.json();
      setTodos((prev) => sortTodos([...prev, todo]));
      setNewTitle("");
      setNewPriority("MOYENNE");
      setNewDueDate("");
      setShowAddOptions(false);
      toast.success("Tâche ajoutée");
      inputRef.current?.focus();
    } catch {
      toast.error("Erreur lors de l\u2019ajout");
    }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTodos((prev) =>
        sortTodos(prev.map((t) => (t.id === updated.id ? updated : t)))
      );
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTodos((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tâche supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.titre);
    setEditPriority(todo.priority);
    setEditDueDate(
      todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : ""
    );
  };

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return;

    try {
      const res = await fetch(`/api/todos/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: editTitle.trim(),
          priority: editPriority,
          dueDate: editDueDate || null,
        }),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTodos((prev) =>
        sortTodos(prev.map((t) => (t.id === updated.id ? updated : t)))
      );
      setEditingId(null);
      toast.success("Tâche modifiée");
    } catch {
      toast.error("Erreur lors de la modification");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const filtered = todos.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "pending", label: "À faire" },
    { key: "completed", label: "Terminées" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <CheckSquare className="h-5 w-5" />
        </div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Tâches
        </h1>
      </div>

      {/* Quick add */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ajouter une tâche..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onFocus={() => setShowAddOptions(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo();
              if (e.key === "Escape") {
                setShowAddOptions(false);
                inputRef.current?.blur();
              }
            }}
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
            style={{
              background: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
          <button
            onClick={addTodo}
            disabled={!newTitle.trim()}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>

        <AnimatePresence>
          {showAddOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <PrioritySelector
                    value={newPriority}
                    onChange={setNewPriority}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar
                    className="h-4 w-4"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="rounded-lg border px-3 py-1.5 text-sm outline-none"
                    style={{
                      background: "var(--bg)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{ background: "var(--bg)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="relative rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{
              color:
                filter === tab.key
                  ? "var(--foreground)"
                  : "var(--text-muted)",
            }}
          >
            {filter === tab.key && (
              <motion.div
                layoutId="activeTab"
                className="glass-card absolute inset-0 rounded-lg"
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Todo list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card flex items-center justify-center rounded-2xl p-12"
            >
              <div
                className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
              />
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card flex flex-col items-center justify-center rounded-2xl p-12 text-center"
            >
              <CheckSquare
                className="mb-3 h-12 w-12"
                style={{ color: "var(--text-muted)", opacity: 0.4 }}
              />
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                Aucune tâche pour le moment
              </p>
            </motion.div>
          ) : (
            filtered.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25 }}
                className="glass-card group rounded-xl p-4"
              >
                {editingId === todo.id ? (
                  <div className="space-y-3">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                      style={{
                        background: "var(--bg)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <PrioritySelector
                        value={editPriority}
                        onChange={setEditPriority}
                      />
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="rounded-lg border px-3 py-1.5 text-sm outline-none"
                        style={{
                          background: "var(--bg)",
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                        }}
                      />
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={cancelEdit}
                          className="rounded-lg p-2 transition-colors hover:bg-red-500/10"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={saveEdit}
                          className="rounded-lg p-2 transition-colors hover:bg-green-500/10"
                          style={{ color: "var(--accent)" }}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTodo(todo)}
                      className="flex-shrink-0 transition-transform hover:scale-110"
                      style={{ color: todo.completed ? "var(--accent)" : "var(--text-muted)" }}
                    >
                      {todo.completed ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onDoubleClick={() => startEditing(todo)}
                    >
                      <span
                        className={`text-sm font-medium transition-all ${
                          todo.completed ? "line-through opacity-50" : ""
                        }`}
                        style={{ color: "var(--foreground)" }}
                      >
                        {todo.titre}
                      </span>
                      {todo.dueDate && (
                        <div className="mt-1 flex items-center gap-1">
                          <Calendar
                            className="h-3 w-3"
                            style={{ color: "var(--text-muted)" }}
                          />
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {new Date(todo.dueDate).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <PriorityBadge priority={todo.priority} />

                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => startEditing(todo)}
                        className="rounded-lg p-1.5 transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="rounded-lg p-1.5 transition-colors hover:text-red-500"
                        style={{ color: "var(--text-muted)" }}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: TodoPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

function PrioritySelector({
  value,
  onChange,
}: {
  value: TodoPriority;
  onChange: (v: TodoPriority) => void;
}) {
  const priorities: TodoPriority[] = ["BASSE", "MOYENNE", "HAUTE"];

  return (
    <div className="flex gap-1">
      {priorities.map((p) => {
        const config = PRIORITY_CONFIG[p];
        const isActive = value === p;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
            style={{
              background: isActive ? config.bg : "transparent",
              color: isActive ? config.color : "var(--text-muted)",
              border: `1px solid ${isActive ? config.color + "40" : "var(--border)"}`,
            }}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
