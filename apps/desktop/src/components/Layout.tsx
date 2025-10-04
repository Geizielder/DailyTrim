import { ReactNode } from "react";
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  SideNav,
  SideNavItems,
  SideNavLink,
  Content,
} from "@carbon/react";
import {
  Dashboard,
  TaskView,
  Music,
  Settings,
} from "@carbon/icons-react";
import { useLocation, useNavigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Dashboard },
    { path: "/tasks", label: "Tarefas", icon: TaskView },
    { path: "/music", label: "Músicas", icon: Music },
    { path: "/settings", label: "Configurações", icon: Settings },
  ];

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

      <SideNav
        aria-label="Side navigation"
        expanded
        isFixedNav
      >
        <SideNavItems>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <SideNavLink
                key={item.path}
                renderIcon={Icon}
                href={item.path}
                isActive={location.pathname === item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
              >
                {item.label}
              </SideNavLink>
            );
          })}
        </SideNavItems>
      </SideNav>

      <Content style={{ backgroundColor: "#f4f4f4" }}>
        <div style={{ padding: "2rem", maxWidth: "1584px", margin: "0 auto" }}>
          {children}
        </div>
      </Content>
    </>
  );
}