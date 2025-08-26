import React, { useState } from "react";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { getUserRole } from "../utils/auth"; // We will create this helper

const DashboardLayout = ({ children, pageTitle }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const userRole = getUserRole();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-layout">
      <AppSidebar 
        role={userRole} 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      <div className="main-content">
        <AppHeader 
          toggleSidebar={toggleSidebar} 
          pageTitle={pageTitle} 
        />
        <main className="content-wrapper">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 