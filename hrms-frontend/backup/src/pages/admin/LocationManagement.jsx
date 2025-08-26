import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../styles/theme.css";

export default function LocationManagement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/companies`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Fetch branches for each company to determine if they exist
      const companiesWithBranchInfo = await Promise.all(
        (response.data.data || []).map(async (company) => {
          try {
            const branchesResponse = await axios.get(
              `${import.meta.env.VITE_API_URL}/admin/branches?companyId=${company.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...company, hasBranches: branchesResponse.data.data.length > 0 };
          } catch (branchErr) {
            console.warn(`Could not fetch branches for company ${company.companyName}:`, branchErr);
            return { ...company, hasBranches: false }; // Assume no branches on error
          }
        })
      );
      setCompanies(companiesWithBranchInfo);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch companies for location management:", err);
      setError("Failed to fetch companies for location management.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center mt-4">Loading locations...</div>
    );
  }

  if (error) {
    return (
      <div className="container text-center mt-4 text-danger">{error}</div>
    );
  }

  return (
    <div className="card">
      <h2 className="mb-4">Location Management (Companies & Branches)</h2>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Company Code</th>
              <th>Has Branches?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.length > 0 ? (
              companies.filter(company => company && company.id).map((company) => (
                <tr key={`company-location-${company.id}`}>
                  <td>{company.companyName}</td>
                  <td>{company.companyCode}</td>
                  <td>{company.hasBranches ? "Yes" : "No"}</td>
                  <td>
                    <Link to={`/admin/companies/${company.id}`} className="btn btn-info btn-sm me-2">
                      {company.hasBranches ? "View/Manage Branches" : "Add First Location (Branch) & Geofence"}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 