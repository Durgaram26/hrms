import React from "react";

const AppHeader = ({ toggleSidebar, pageTitle }) => {
  return (
    <header className="app-header">
      <div className="d-flex align-items-center">
        <button className="btn sidebar-toggle-btn" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
        <h1 className="page-title">{pageTitle}</h1>
      </div>
      <div className="d-flex align-items-center">
        {/* Future user menu can go here */}
      </div>
    </header>
  );
};

export default AppHeader; 