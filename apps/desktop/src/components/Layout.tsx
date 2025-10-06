import { ReactNode, useState } from "react";
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
} from "@carbon/react";
import {
  Dashboard,
  TaskView,
  Music,
  Settings,
} from "@carbon/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<string | null>("tasks");

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Dashboard, id: "dashboard" },
    { path: "/tasks", label: "Tarefas", icon: TaskView, id: "tasks" },
    { path: "/music", label: "Músicas", icon: Music, id: "music" },
    { path: "/settings", label: "Configurações", icon: Settings, id: "settings" },
  ];

  const handleIconClick = (itemId: string, itemPath: string) => {
    if (activePanel === itemId) {
      setActivePanel(null);
    } else {
      setActivePanel(itemId);
      navigate(itemPath);
    }
  };

  const isPanelOpen = activePanel !== null;
  const ICON_BAR_WIDTH = 48; // 3rem
  const PANEL_WIDTH = 240; // 16rem

  return (
    <>
      <Header aria-label="Daily Trim">
        <HeaderName href="#" prefix="">
          Daily Trim
        </HeaderName>
        <HeaderNavigation aria-label="Daily Trim">
          {navItems.map((item) => (
            <HeaderMenuItem
              key={item.path}
              href={item.path}
              isCurrentPage={location.pathname === item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
            >
              {item.label}
            </HeaderMenuItem>
          ))}
        </HeaderNavigation>
      </Header>

      {/* Activity Bar (barra de ícones vertical) */}
      <aside
        style={{
          position: "fixed",
          top: "3rem",
          left: 0,
          width: `${ICON_BAR_WIDTH}px`,
          height: "calc(100vh - 3rem)",
          backgroundColor: "#161616",
          zIndex: 8000,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #262626",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleIconClick(item.id, item.path)}
              style={{
                width: "100%",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "none",
                borderLeft: isActive ? "2px solid #0f62fe" : "2px solid transparent",
                color: isActive ? "#fff" : "#8d8d8d",
                cursor: "pointer",
                transition: "color 0.11s, background-color 0.11s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "#8d8d8d";
                }
              }}
              aria-label={item.label}
              title={item.label}
            >
              <Icon size={24} />
            </button>
          );
        })}
      </aside>

      {/* Side Panel (painel expansível) */}
      <aside
        style={{
          position: "fixed",
          top: "3rem",
          left: `${ICON_BAR_WIDTH}px`,
          width: isPanelOpen ? `${PANEL_WIDTH}px` : "0px",
          height: "calc(100vh - 3rem)",
          backgroundColor: "#1e1e1e",
          zIndex: 7000,
          overflow: "hidden",
          transition: "width 0.11s cubic-bezier(0.2, 0, 0.38, 0.9)",
          borderRight: isPanelOpen ? "1px solid #262626" : "none",
        }}
      >
        {isPanelOpen && (
          <div style={{ width: `${PANEL_WIDTH}px`, height: "100%", overflow: "auto" }}>
            <div
              style={{
                padding: "1rem",
                borderBottom: "1px solid #262626",
                color: "#f4f4f4",
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {navItems.find((item) => item.id === activePanel)?.label}
            </div>
            <nav style={{ padding: "0.5rem 0" }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "2rem",
                      padding: "0 1rem",
                      color: isActive ? "#fff" : "#c6c6c6",
                      backgroundColor: isActive ? "#2a2d2e" : "transparent",
                      textDecoration: "none",
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                      transition: "background-color 0.11s, color 0.11s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "#2a2d2e";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main
        style={{
          marginTop: "3rem",
          marginLeft: `${ICON_BAR_WIDTH + (isPanelOpen ? PANEL_WIDTH : 0)}px`,
          transition: "margin-left 0.11s cubic-bezier(0.2, 0, 0.38, 0.9)",
          backgroundColor: "#f4f4f4",
          minHeight: "calc(100vh - 3rem)",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "1584px", margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </>
  );
}