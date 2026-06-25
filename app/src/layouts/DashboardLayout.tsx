
import "./DashboardLayout.css";

interface DashboardLayoutProps {
  sidebarItems: { id: string; label: string; icon?: string; onClick?: () => void }[];
  activeSidebarId: string;
  toolbarTitle: string;
  toolbarActions?: React.ReactNode;
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebarItems,
  activeSidebarId,
  toolbarTitle,
  toolbarActions,
  children,
}) => {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">📦 Dashboard</div>
        <ul className="sidebar-menu">
          {sidebarItems.map((item) => (
            <li
              key={item.id}
              className={item.id === activeSidebarId ? "active" : ""}
              onClick={item.onClick}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </li>
          ))}
        </ul>
      </aside>
      <div className="main-area">
        <header className="toolbar">
          <div className="toolbar-title">{toolbarTitle}</div>
          <div className="toolbar-actions">{toolbarActions}</div>
        </header>
        <main className="content">{children}</main>
       

      </div>
    </div>
  );
};

export default DashboardLayout;
