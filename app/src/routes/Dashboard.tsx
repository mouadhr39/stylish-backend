import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Category from "../components/Category";
import Product from "../components/Product";
import Collection from "../components/Collection";
import { useAuthorization } from "../ctx/AuthenticationContext";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("categories");
  const { logout } = useAuthorization();

  const sidebarItems = [
    { id: "categories", label: "Categories", icon: "📂", onClick: () => setActiveTab("categories") },
    { id: "products", label: "Products", icon: "📦", onClick: () => setActiveTab("products") },
    { id: "collections", label: "Collections", icon: "📑", onClick: () => setActiveTab("collections") },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "products":
        return <Product />;
      case "collections":
        return <Collection />;
      case "categories":
      default:
        return <Category />;
    }
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      activeSidebarId={activeTab}
      toolbarTitle={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
      toolbarActions={
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
