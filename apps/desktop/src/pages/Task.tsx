import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

// Type alias para o retorno do setInterval
type TimerHandle = ReturnType<typeof setInterval>;
import {
  TextInput,
  Button,
  InlineNotification,
  Select,
  SelectItem,
  TextArea,
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableExpandRow,
  TableExpandedRow,
  TableExpandHeader,
  Tag,
  OverflowMenu,
  OverflowMenuItem,
  Stack,
  Dropdown,
  MultiSelect,
  Pagination,
} from "@carbon/react";
import { Add, Settings, CircleFilled, InProgress, CheckmarkFilled, PlayFilled, StopFilled } from "@carbon/icons-react";
import { pb } from "../lib/pb";
import { formatTime } from "../lib/timer";

interface Task {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  priority: string;
  due_at: string;
  timeSpent: number;
  notes: string;
  owner: string;
  collectionId?: string;
  collectionName?: string;
  created?: string;
  updated?: string;
}

const allColumns = [
  { key: "title", header: "Nome", alwaysVisible: true },
  { key: "status", header: "Status", alwaysVisible: false },
  { key: "priority", header: "Prioridade", alwaysVisible: false },
  { key: "due_at", header: "Vencimento", alwaysVisible: false },
  { key: "timeSpent", header: "Tempo gasto", alwaysVisible: false },
  { key: "actions", header: "", alwaysVisible: true },
];

const statusOptions = [
  { id: "todo", label: "A fazer", icon: CircleFilled, color: "#8d8d8d" },
  { id: "doing", label: "Em progresso", icon: InProgress, color: "#0f62fe" },
  { id: "done", label: "Concluído", icon: CheckmarkFilled, color: "#24a148" },
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<"todo" | "doing" | "done">("todo");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.filter(col => col.alwaysVisible || col.key === "status" || col.key === "priority" || col.key === "due_at").map(col => col.key)
  );
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [runningTimers, setRunningTimers] = useState<{ [key: string]: TimerHandle }>({});
  const [timerSeconds, setTimerSeconds] = useState<{ [key: string]: number }>({});

  async function loadTasks() {
    try {
      setLoading(true);

      if (!pb.authStore.isValid) {
        setError("Usuário não autenticado. Faça login novamente.");
        return;
      }

      const fetchUrl = `${pb.baseUrl}/api/collections/tasks/records?page=1&perPage=500`;
      const response = await fetch(fetchUrl, {
        headers: {
          'Authorization': `Bearer ${pb.authStore.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const res = await response.json();
      setTasks(res.items || []);
      setFilteredTasks(res.items || []);
      setError("");
    } catch (err: any) {
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

      if (!pb.authStore.isValid) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const userId = pb.authStore.record?.id;

      if (!userId) {
        throw new Error("Usuário não identificado");
      }

      await pb.collection("tasks").create({
        title: newTitle.trim(),
        status: newStatus,
        priority: newPriority || null,
        due_at: newDueDate || null,
        notes: newNotes.trim() || null,
        owner: userId,
        timeSpent: 0,
      });

      setNewTitle("");
      setNewStatus("todo");
      setNewPriority("medium");
      setNewDueDate("");
      setNewNotes("");
      setError("");
      setModalOpen(false);

      await loadTasks();
    } catch (err: any) {
      setError("Erro ao criar tarefa: " + (err.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  async function updateTaskStatus(taskId: string, newStatus: "todo" | "doing" | "done") {
    try {
      await pb.collection("tasks").update(taskId, { status: newStatus });
      await loadTasks();
    } catch (err: any) {
      setError("Erro ao atualizar status: " + err.message);
    }
  }

  async function updateTaskNotes(taskId: string, notes: string) {
    try {
      await pb.collection("tasks").update(taskId, { notes });
      await loadTasks();
      // Remove from editing state
      setEditingNotes((prev) => {
        const newState = { ...prev };
        delete newState[taskId];
        return newState;
      });
    } catch (err: any) {
      setError("Erro ao atualizar notas: " + err.message);
    }
  }

  async function deleteTask(taskId: string) {
    try {
      // Stop timer if running
      if (runningTimers[taskId]) {
        stopTimer(taskId);
      }
      await pb.collection("tasks").delete(taskId);
      await loadTasks();
    } catch (err: any) {
      setError("Erro ao deletar tarefa: " + err.message);
    }
  }

  function startTimer(taskId: string) {
    if (runningTimers[taskId]) return; // Already running

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Initialize timer seconds with current timeSpent
    setTimerSeconds(prev => ({
      ...prev,
      [taskId]: task.timeSpent,
    }));

    const interval = setInterval(() => {
      setTimerSeconds(prev => ({
        ...prev,
        [taskId]: (prev[taskId] || task.timeSpent) + 1,
      }));
    }, 1000);

    setRunningTimers(prev => ({
      ...prev,
      [taskId]: interval,
    }));
  }

  async function stopTimer(taskId: string) {
    const interval = runningTimers[taskId];
    if (!interval) return;

    clearInterval(interval);

    // Remove from running timers
    setRunningTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[taskId];
      return newTimers;
    });

    // Save the time to database
    const finalTime = timerSeconds[taskId];
    if (finalTime !== undefined) {
      try {
        await pb.collection("tasks").update(taskId, {
          timeSpent: finalTime
        });
        await loadTasks();
      } catch (err: any) {
        setError("Erro ao salvar tempo: " + err.message);
      }
    }
  }

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(runningTimers).forEach(interval => clearInterval(interval));
    };
  }, [runningTimers]);

  function handleSearch(_event: any, value?: string) {
    const searchValue = (value || '').toLowerCase();
    if (!searchValue) {
      setFilteredTasks(tasks);
      setCurrentPage(1); // Reset to first page
      return;
    }

    const filtered = tasks.filter((task) =>
      task.title.toLowerCase().includes(searchValue) ||
      task.status.toLowerCase().includes(searchValue) ||
      task.priority?.toLowerCase().includes(searchValue)
    );
    setFilteredTasks(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }


  function getPriorityTag(priority: string) {
    if (!priority || priority.trim() === "") return "-";

    switch (priority) {
      case "high":
        return <Tag type="red">Alta</Tag>;
      case "medium":
        return <Tag type="cyan">Média</Tag>;
      case "low":
        return <Tag type="green">Baixa</Tag>;
      default:
        return <Tag type="gray">{priority}</Tag>;
    }
  }

  function formatDate(dateString: string) {
    if (!dateString || dateString.trim() === "") return "-";
    return new Date(dateString).toLocaleDateString('pt-BR');
  }


  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headers = allColumns.filter(col => visibleColumns.includes(col.key));

  // Paginação
  const totalItems = filteredTasks.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  const rows = paginatedTasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: getPriorityTag(task.priority),
    due_at: formatDate(task.due_at),
    timeSpent: task,
    actions: task,
    isExpanded: false,
  }));

  const columnSelectItems = allColumns
    .filter(col => !col.alwaysVisible)
    .map(col => ({
      id: col.key,
      label: col.header,
    }));

  return (
    <div style={{ padding: "2rem" }}>
      {error && (
        <InlineNotification
          kind="error"
          title="Erro"
          subtitle={error}
          onClose={() => setError("")}
          style={{ marginBottom: "1rem", maxWidth: "100%" }}
        />
      )}

      <DataTable rows={rows} headers={headers}>
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          getExpandHeaderProps,
          getExpandedRowProps,
        }) => (
          <TableContainer
            title="Tarefas"
            description="Gerencie suas tarefas diárias"
          >
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  placeholder="Buscar tarefas..."
                  onChange={handleSearch}
                />
                <Button
                  kind="ghost"
                  renderIcon={Settings}
                  onClick={() => setColumnSettingsOpen(true)}
                  iconDescription="Configurar colunas"
                  hasIconOnly
                />
                <Button
                  renderIcon={Add}
                  onClick={() => setModalOpen(true)}
                >
                  Adicionar tarefa
                </Button>
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()} aria-label="Tabela de tarefas">
              <TableHead>
                <TableRow>
                  <TableExpandHeader {...getExpandHeaderProps()} />
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && paginatedTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headers.length + 1} style={{ textAlign: "center", padding: "2rem" }}>
                      Carregando tarefas...
                    </TableCell>
                  </TableRow>
                ) : filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headers.length + 1} style={{ textAlign: "center", padding: "2rem" }}>
                      Nenhuma tarefa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => {
                    const task = paginatedTasks[index];
                    const currentNotes = editingNotes[task.id] ?? task.notes ?? "";

                    return (
                      <>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => {
                            if (cell.info.header === 'status') {
                              const currentStatus = statusOptions.find(s => s.id === task.status);
                              const StatusIcon = currentStatus?.icon || CircleFilled;

                              return (
                                <TableCell key={cell.id}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <StatusIcon
                                      size={16}
                                      style={{ color: currentStatus?.color, flexShrink: 0 }}
                                    />
                                    <Dropdown
                                      id={`status-${task.id}`}
                                      titleText=""
                                      label=""
                                      items={statusOptions}
                                      itemToString={(item) => item ? item.label : ''}
                                      initialSelectedItem={currentStatus}
                                      onChange={({ selectedItem }) => {
                                        if (selectedItem) {
                                          updateTaskStatus(task.id, selectedItem.id as "todo" | "doing" | "done");
                                        }
                                      }}
                                      size="sm"
                                      type="inline"
                                    />
                                  </div>
                                </TableCell>
                              );
                            }

                            if (cell.info.header === 'timeSpent') {
                              const isRunning = !!runningTimers[task.id];
                              const currentTime = isRunning ? timerSeconds[task.id] : task.timeSpent;
                              const isCompleted = task.status === 'done';

                              return (
                                <TableCell key={cell.id}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span style={{ fontFamily: "monospace", minWidth: "4.5rem" }}>
                                      {formatTime(currentTime || 0)}
                                    </span>
                                    {!isCompleted && (
                                      <Button
                                        kind="ghost"
                                        size="sm"
                                        hasIconOnly
                                        iconDescription={isRunning ? "Pausar" : "Iniciar"}
                                        renderIcon={isRunning ? StopFilled : PlayFilled}
                                        onClick={() => {
                                          if (isRunning) {
                                            stopTimer(task.id);
                                          } else {
                                            startTimer(task.id);
                                          }
                                        }}
                                      />
                                    )}
                                  </div>
                                </TableCell>
                              );
                            }

                            if (cell.info.header === 'actions') {
                              return (
                                <TableCell key={cell.id} className="cds--table-column-menu">
                                  <OverflowMenu size="sm" flipped>
                                    <OverflowMenuItem itemText="Editar" />
                                    <OverflowMenuItem
                                      itemText="Excluir"
                                      isDelete
                                      onClick={() => deleteTask(task.id)}
                                    />
                                  </OverflowMenu>
                                </TableCell>
                              );
                            }

                            return <TableCell key={cell.id}>{cell.value}</TableCell>;
                          })}
                        </TableExpandRow>
                        {row.isExpanded && (
                          <TableExpandedRow colSpan={headers.length + 1} {...getExpandedRowProps({ row })}>
                            <div style={{ padding: "1rem" }}>
                              <h6 style={{ marginBottom: "0.5rem", fontWeight: 600 }}>Notas da tarefa</h6>
                              <TextArea
                                id={`notes-${task.id}`}
                                labelText=""
                                placeholder="Adicione notas sobre esta tarefa..."
                                value={currentNotes}
                                onChange={(e) => {
                                  setEditingNotes((prev) => ({
                                    ...prev,
                                    [task.id]: e.target.value,
                                  }));
                                }}
                                rows={4}
                                style={{ marginBottom: "1rem" }}
                              />
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <Button
                                  size="sm"
                                  onClick={() => updateTaskNotes(task.id, currentNotes)}
                                  disabled={currentNotes === (task.notes ?? "")}
                                >
                                  Salvar notas
                                </Button>
                                <Button
                                  size="sm"
                                  kind="secondary"
                                  onClick={() => {
                                    setEditingNotes((prev) => {
                                      const newState = { ...prev };
                                      delete newState[task.id];
                                      return newState;
                                    });
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </TableExpandedRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

      {filteredTasks.length > 0 && (
        <Pagination
          page={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          pageSizes={[10, 20, 30, 50]}
          onChange={({ page, pageSize: newPageSize }) => {
            setCurrentPage(page);
            if (newPageSize !== pageSize) {
              setPageSize(newPageSize);
              setCurrentPage(1); // Reset to first page when changing page size
            }
          }}
          itemsPerPageText="Itens por página"
          pageRangeText={(_current, total) => `de ${total} página${total > 1 ? 's' : ''}`}
          itemRangeText={(min, max, total) => `${min}–${max} de ${total} itens`}
        />
      )}

      {typeof document !== 'undefined' && ReactDOM.createPortal(
        <ComposedModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setError("");
          }}
          size="md"
        >
          <ModalHeader title="Adicionar nova tarefa" />
          <ModalBody hasForm>
            <Stack gap={6}>
              <TextInput
                id="modal-task-title"
                labelText="Título da tarefa *"
                placeholder="Ex: Revisar código do projeto"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={loading}
                data-modal-primary-focus
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Select
                  id="modal-status"
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
                  id="modal-priority"
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
                id="modal-due-date"
                labelText="Data de vencimento"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                disabled={loading}
              />

              <TextArea
                id="modal-notes"
                labelText="Notas"
                placeholder="Adicione observações sobre a tarefa..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                disabled={loading}
                rows={4}
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              kind="secondary"
              onClick={() => {
                setModalOpen(false);
                setError("");
              }}
            >
              Cancelar
            </Button>
            <Button
              kind="primary"
              onClick={addTask}
              disabled={!newTitle.trim() || loading}
            >
              {loading ? "Adicionando..." : "Adicionar"}
            </Button>
          </ModalFooter>
        </ComposedModal>,
        document.body
      )}

      {typeof document !== 'undefined' && ReactDOM.createPortal(
        <ComposedModal
          open={columnSettingsOpen}
          onClose={() => setColumnSettingsOpen(false)}
          size="sm"
        >
          <ModalHeader title="Configurar colunas visíveis" />
          <ModalBody>
            <MultiSelect
              id="column-selector"
              titleText="Selecione as colunas para exibir"
              label="Escolher colunas"
              items={columnSelectItems}
              itemToString={(item) => item ? item.label : ''}
              initialSelectedItems={columnSelectItems.filter(item =>
                visibleColumns.includes(item.id)
              )}
              onChange={({ selectedItems }) => {
                const alwaysVisibleKeys = allColumns.filter(col => col.alwaysVisible).map(col => col.key);
                const selectedKeys = selectedItems ? selectedItems.map(item => item.id) : [];
                setVisibleColumns([...alwaysVisibleKeys, ...selectedKeys]);
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              kind="primary"
              onClick={() => setColumnSettingsOpen(false)}
            >
              Concluído
            </Button>
          </ModalFooter>
        </ComposedModal>,
        document.body
      )}
    </div>
  );
}