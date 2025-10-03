import { useEffect, useState } from "react";
import {
  TextInput,
  Button,
  Tile,
  InlineNotification,
  Select,
  SelectItem,
  TextArea,
  Form,
  Stack,
} from "@carbon/react";
import { pb } from "../lib/pb";

interface Task {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  priority: string; // Pode ser "low", "medium", "high" ou ""
  due_at: string; // Pode ser data ou ""
  timeSpent: number;
  notes: string; // Pode ter texto ou ""
  owner: string;
  collectionId?: string;
  collectionName?: string;
  created?: string;
  updated?: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<"todo" | "doing" | "done">("todo");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadTasks() {
    try {
      setLoading(true);

      // Verifica se está autenticado - não precisa do userId, só do token
      if (!pb.authStore.isValid) {
        setError("Usuário não autenticado. Faça login novamente.");
        return;
      }

      console.log("Carregando tarefas...");
      console.log("Auth válido:", pb.authStore.isValid);
      console.log("Token:", pb.authStore.token);
      console.log("Record:", pb.authStore.record);

      // Usa fetch direto - SEM sort porque o campo 'created' não existe!
      const fetchUrl = `${pb.baseUrl}/api/collections/tasks/records?page=1&perPage=500`;
      console.log("Buscando tarefas via fetch:", fetchUrl);

      const response = await fetch(fetchUrl, {
        headers: {
          'Authorization': `Bearer ${pb.authStore.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const res = await response.json();

      console.log("✅ Resposta completa:", res);
      console.log("✅ Total de tarefas:", res.totalItems);
      console.log("✅ Items:", res.items);

      setTasks(res.items || []);
      setError("");
    } catch (err: any) {
      console.error("❌ Erro ao carregar tarefas:", err);
      console.error("❌ Status:", err.status);
      console.error("❌ Response:", err.response);

      // Ignora erro de autocancellation
      if (err.message?.includes('autocancelled')) {
        return;
      }

      setError("Erro ao carregar tarefas: " + (err.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();

    if (!newTitle.trim()) {
      setError("O título é obrigatório");
      return;
    }

    try {
      setLoading(true);

      // Verifica autenticação
      if (!pb.authStore.isValid) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      // Pega o ID do record do authStore (forma correta)
      const userId = pb.authStore.record?.id;

      if (!userId) {
        throw new Error("Usuário não identificado");
      }

      console.log("Criando tarefa para usuário:", userId);

      await pb.collection("tasks").create({
        title: newTitle.trim(),
        status: newStatus,
        priority: newPriority || null,
        due_at: newDueDate || null,
        notes: newNotes.trim() || null,
        owner: userId,
        timeSpent: 0,
      });

      console.log("✅ Tarefa criada com sucesso!");

      // Limpar formulário
      setNewTitle("");
      setNewStatus("todo");
      setNewPriority("medium");
      setNewDueDate("");
      setNewNotes("");
      setError("");

      // Recarregar tarefas
      await loadTasks();
    } catch (err: any) {
      console.error("❌ Erro ao criar tarefa:", err);
      console.error("❌ Response:", err.response);
      setError("Erro ao criar tarefa: " + (err.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  async function deleteTask(taskId: string) {
    try {
      await pb.collection("tasks").delete(taskId);
      await loadTasks();
    } catch (err: any) {
      setError("Erro ao deletar tarefa: " + err.message);
    }
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <h2>Minhas Tarefas</h2>

      {error && (
        <InlineNotification
          kind="error"
          title="Erro"
          subtitle={error}
          onClose={() => setError("")}
          style={{ marginBottom: "1rem" }}
        />
      )}

      <Form onSubmit={addTask} style={{ marginBottom: "2rem" }}>
        <Stack gap={5}>
          <TextInput
            id="newTask"
            labelText="Título da tarefa *"
            placeholder="Ex: Revisar código do projeto"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={loading}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Select
              id="status"
              labelText="Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              disabled={loading}
            >
              <SelectItem value="todo" text="A fazer" />
              <SelectItem value="doing" text="Fazendo" />
              <SelectItem value="done" text="Concluído" />
            </Select>

            <Select
              id="priority"
              labelText="Prioridade"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              disabled={loading}
            >
              <SelectItem value="low" text="Baixa" />
              <SelectItem value="medium" text="Média" />
              <SelectItem value="high" text="Alta" />
            </Select>
          </div>

          <TextInput
            id="due_date"
            labelText="Data de vencimento (YYYY-MM-DD)"
            type="date"
            placeholder="YYYY-MM-DD"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            disabled={loading}
          />

          <TextArea
            id="notes"
            labelText="Notas"
            placeholder="Adicione observações sobre a tarefa..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            disabled={loading}
            rows={3}
          />

          <Button type="submit" disabled={!newTitle.trim() || loading}>
            {loading ? "Adicionando..." : "Adicionar Tarefa"}
          </Button>
        </Stack>
      </Form>

      <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>
        Lista de Tarefas ({tasks.length})
      </h3>

      {loading && tasks.length === 0 && (
        <p style={{ textAlign: "center", color: "#666" }}>Carregando tarefas...</p>
      )}

      {!loading && tasks.length === 0 && !error && (
        <p style={{ textAlign: "center", color: "#666", marginTop: "2rem" }}>
          Nenhuma tarefa cadastrada. Adicione uma nova tarefa acima!
        </p>
      )}

      <Stack gap={4}>
        {tasks.map((task) => (
          <Tile key={task.id} style={{ padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 0.5rem 0" }}>{task.title}</h4>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "#666" }}>
                  <span>
                    Status: <strong>{task.status === "todo" ? "A fazer" : task.status === "doing" ? "Fazendo" : "Concluído"}</strong>
                  </span>
                  {task.priority && task.priority.trim() !== "" && (
                    <span>
                      Prioridade: <strong>{task.priority === "low" ? "Baixa" : task.priority === "medium" ? "Média" : "Alta"}</strong>
                    </span>
                  )}
                  {task.due_at && task.due_at.trim() !== "" && (
                    <span>
                      Vencimento: <strong>{new Date(task.due_at).toLocaleDateString('pt-BR')}</strong>
                    </span>
                  )}
                </div>
                {task.notes && task.notes.trim() !== "" && (
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", color: "#525252" }}>
                    {task.notes}
                  </p>
                )}
              </div>
              <Button
                kind="danger--ghost"
                size="sm"
                onClick={() => deleteTask(task.id)}
              >
                Excluir
              </Button>
            </div>
          </Tile>
        ))}
      </Stack>
    </div>
  );
}
