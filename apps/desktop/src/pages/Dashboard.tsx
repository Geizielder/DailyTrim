import { useEffect, useState } from "react";
import {
  Grid,
  Column,
  Tile,
  SkeletonText,
} from "@carbon/react";
import {
  CheckmarkFilled,
  InProgress,
  CircleFilled,
  Time,
} from "@carbon/icons-react";
import { pb } from "../lib/pb";

interface Task {
  id: string;
  status: string;
  timeSpent: number;
}

interface DashboardStats {
  totalTasks: number;
  todoTasks: number;
  doingTasks: number;
  doneTasks: number;
  totalTimeSpent: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const tasks = await pb.collection("tasks").getFullList<Task>({
        $autoCancel: false,
      });

      const stats: DashboardStats = {
        totalTasks: tasks.length,
        todoTasks: tasks.filter((t: Task) => t.status === "todo").length,
        doingTasks: tasks.filter((t: Task) => t.status === "doing").length,
        doneTasks: tasks.filter((t: Task) => t.status === "done").length,
        totalTimeSpent: tasks.reduce((acc: number, t: Task) => acc + (t.timeSpent || 0), 0),
      };

      setStats(stats);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <div>
        <h1>Dashboard</h1>
        <Grid style={{ marginTop: "2rem" }}>
          <Column lg={4} md={4} sm={4}>
            <Tile>
              <SkeletonText />
            </Tile>
          </Column>
          <Column lg={4} md={4} sm={4}>
            <Tile>
              <SkeletonText />
            </Tile>
          </Column>
          <Column lg={4} md={4} sm={4}>
            <Tile>
              <SkeletonText />
            </Tile>
          </Column>
        </Grid>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: "2rem" }}>Dashboard</h1>

      <Grid>
        <Column lg={4} md={4} sm={4}>
          <Tile
            style={{
              padding: "1.5rem",
              minHeight: "8rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <CircleFilled size={24} style={{ color: "#8d8d8d" }} />
              <h3 style={{ margin: 0 }}>A Fazer</h3>
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "600" }}>
              {stats?.todoTasks}
            </div>
          </Tile>
        </Column>

        <Column lg={4} md={4} sm={4}>
          <Tile
            style={{
              padding: "1.5rem",
              minHeight: "8rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <InProgress size={24} style={{ color: "#0f62fe" }} />
              <h3 style={{ margin: 0 }}>Em Progresso</h3>
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "600" }}>
              {stats?.doingTasks}
            </div>
          </Tile>
        </Column>

        <Column lg={4} md={4} sm={4}>
          <Tile
            style={{
              padding: "1.5rem",
              minHeight: "8rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <CheckmarkFilled size={24} style={{ color: "#24a148" }} />
              <h3 style={{ margin: 0 }}>Concluído</h3>
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "600" }}>
              {stats?.doneTasks}
            </div>
          </Tile>
        </Column>

        <Column lg={8} md={8} sm={4}>
          <Tile
            style={{
              padding: "1.5rem",
              minHeight: "8rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Time size={24} />
              <h3 style={{ margin: 0 }}>Tempo Total Gasto</h3>
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: "600", fontFamily: "monospace" }}>
              {formatTime(stats?.totalTimeSpent || 0)}
            </div>
          </Tile>
        </Column>

        <Column lg={4} md={4} sm={4}>
          <Tile
            style={{
              padding: "1.5rem",
              minHeight: "8rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ margin: 0, marginBottom: "1rem" }}>Total de Tarefas</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: "600" }}>
              {stats?.totalTasks}
            </div>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
}