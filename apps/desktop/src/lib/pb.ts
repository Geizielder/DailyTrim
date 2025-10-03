// apps/desktop/src/lib/pb.ts
import PocketBase from "pocketbase";

export const pb = new PocketBase("http://127.0.0.1:8090");


// Se quiser manter sessão entre reloads
pb.authStore.loadFromCookie(document.cookie);

// Salvar sessão de volta no cookie (opcional)
pb.authStore.onChange(() => {
  document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
});

// login usuário
export async function login(email: string, password: string) {
  const auth = await pb.collection("users").authWithPassword(email, password);
  return auth; // { token, record }
}

// CRUD tasks
export async function createTask(input: {
  title: string;
  status?: "todo" | "doing" | "done";
  priority?: "low" | "medium" | "high";
  due_at?: string | null;
  notes?: string;
}) {
  const userId = pb.authStore.record?.id; // Usar record ao invés de model
  if (!userId) throw new Error("Sem sessão");
  return pb.collection("tasks").create({
    owner: userId,
    timeSpent: 0,
    status: input.status ?? "todo",
    priority: input.priority ?? "medium",
    ...input,
  });
}

export async function listMyTasks() {
  if (!pb.authStore.isValid) throw new Error("Sem sessão");

  // Não precisa de filtro - o PocketBase filtra automaticamente pela regra de acesso
  return pb.collection("tasks").getList(1, 50, {
    sort: "-created",
  });
}

export async function updateTask(id: string, patch: Partial<Record<string, any>>) {
  return pb.collection("tasks").update(id, patch);
}

export async function deleteTask(id: string) {
  return pb.collection("tasks").delete(id);
}
