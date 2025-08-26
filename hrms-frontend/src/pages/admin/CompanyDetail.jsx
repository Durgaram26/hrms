import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../../styles/theme.css";

export default function CompanyDetail() {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [branches, setBranches] = useState([]);
  const [numBranchesToAdd, setNumBranchesToAdd] = useState(1); // New state for number of branches
  const [newBranches, setNewBranches] = useState([ // Array for new branches
    {
      branchName: "",
      branchCode: "",
      address: "",
      cityId: null,
      cityNameInput: "", // New: for manual city name input
      phone: "",
      email: "",
    },
  ]);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editingCityNameInput, setEditingCityNameInput] = useState(""); // New: for editing manual city name input
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [showAddBranchForm, setShowAddBranchForm] = useState(false); // New state for toggling form
  const [showCityModal, setShowCityModal] = useState(false); // New state for city modal
  const [creatingCityForBranchIndex, setCreatingCityForBranchIndex] = useState(null); // Which new branch input triggered city creation
  const [creatingCityForEditingBranch, setCreatingCityForEditingBranch] = useState(false); // If editing branch triggered city creation
  const [states, setStates] = useState([]); // New state for states

  // FIX: Initialize showAddBranchForm based on whether branches exist
  useEffect(() => {
    if (!loading && branches.length === 0) {
      setShowAddBranchForm(true);
    }
  }, [loading, branches]);

  useEffect(() => {
    fetchCompanyDetails();
    fetchBranches();
    fetchCities();
    // FIX: Call fetchStates here to populate states for NewCityModal
    fetchStates();
  }, [companyId]); // Re-fetch when companyId changes

  const fetchCompanyDetails = async () => {
    try {
      // FIX: Only fetch if companyId is defined
      if (!companyId) {
        setLoading(false);
        return;
      }
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/companies/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompany(response.data.data);
    } catch (err) {
      console.error("Failed to fetch company details:", err);
      setError("Failed to fetch company details.");
    }
  };

  const fetchBranches = async () => {
    try {
      // FIX: Only fetch if companyId is defined
      if (!companyId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/branches?companyId=${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBranches(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setError("Failed to fetch branches for this company.");
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/cities`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCities(response.data.data);
      // FIX: Add console log to inspect cities data after fetch
      console.log('Fetched cities:', response.data.data);
    } catch (err) {
      console.error("Failed to fetch cities:", err);
      setError("Failed to fetch cities for branch creation.");
    }
  };

  // FIX: Add fetchStates function to CompanyDetail
  const fetchStates = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/states`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStates(response.data.data || []); // Ensure states is an array
    } catch (err) {
      console.error("Failed to fetch states for city modal:", err);
      setError("Failed to fetch states for city modal.");
    }
  };

  const handleNumBranchesChange = (e) => {
    const count = Math.max(1, parseInt(e.target.value) || 1);
    setNumBranchesToAdd(count);
    setNewBranches(Array.from({ length: count }, () => ({
      branchName: "",
      branchCode: "",
      address: "",
      cityId: null,
      cityNameInput: "", // Initialize new city name input
      phone: "",
      email: "",
    })));
  };

  const handleNewBranchInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedBranches = [...newBranches];

    if (name === "cityNameInput") {
      updatedBranches[index] = { ...updatedBranches[index], [name]: value, cityId: null }; // Clear cityId when typing
    } else {
      updatedBranches[index] = { ...updatedBranches[index], [name]: value };
    }
    setNewBranches(updatedBranches);
  };

  const handleEditBranchInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "cityNameInput") {
      setEditingBranch({ ...editingBranch, [name]: value, cityId: null }); // Clear cityId when typing
    } else {
      setEditingBranch({ ...editingBranch, [name]: value });
    }
  };

  const handleSelectNewBranchCity = (index, city) => {
    const updatedBranches = [...newBranches];
    updatedBranches[index] = { ...updatedBranches[index], cityId: city.cityId, cityNameInput: city.cityName };
    setNewBranches(updatedBranches);
  };

  const handleSelectEditingBranchCity = (city) => {
    setEditingBranch({ ...editingBranch, cityId: city.cityId, cityNameInput: city.cityName });
  };

  const handleCityCreated = (newCity) => {
    // Refresh cities list
    fetchCities();
    // Automatically select the new city in the relevant branch form
    if (creatingCityForEditingBranch) {
      handleSelectEditingBranchCity(newCity);
    } else if (creatingCityForBranchIndex !== null) {
      handleSelectNewBranchCity(creatingCityForBranchIndex, newCity);
    }
    // Close modal and reset flags
    setShowCityModal(false);
    setCreatingCityForBranchIndex(null);
    setCreatingCityForEditingBranch(false);
  };

  const handleAddOrUpdateBranch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editingBranch) {
        if (!editingBranch.cityId) {
          setError("Please select a city from the suggestions or ensure your typed city matches an existing one.");
          return;
        }
        await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/branches/${editingBranch.branchId}`,
          editingBranch,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setError("");
        setEditingBranch(null);
        setEditingCityNameInput(""); // Reset input
      } else {
        // Create multiple branches
        const branchesToCreate = newBranches.filter(branch => {
          if (!branch.cityId) {
            setError("Please select a city from the suggestions for all branches or ensure typed cities match existing ones.");
            return false;
          }
          return true;
        });

        if (branchesToCreate.length !== newBranches.length) return; // Stop if validation failed

        // FIX: If this is the first set of branches, set the first one as Head Office
        const isFirstBranch = branches.length === 0;
        if (isFirstBranch && branchesToCreate.length > 0) {
          branchesToCreate[0].isHeadOffice = true;
        }

        await Promise.all(
          branchesToCreate.map(async (branch) => {
            await axios.post(
              `${import.meta.env.VITE_API_URL}/admin/branches`,
              { ...branch, companyId: parseInt(companyId) }, // Associate with current company
              { headers: { Authorization: `Bearer ${token}` } }
            );
          })
        );
        setError("");
        setNumBranchesToAdd(1); // Reset to 1 input field
        setNewBranches([ // Reset new branch inputs
          {
            branchName: "",
            branchCode: "",
            address: "",
            cityId: null,
            cityNameInput: "", // Reset input
            phone: "",
            email: "",
          },
        ]);
      }
      fetchBranches(); // Refresh list
    } catch (err) {
      console.error("Error saving branch:", err);
      setError("Failed to save branch: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEditBranchClick = (branch) => {
    setEditingBranch({ ...branch, cityNameInput: branch.city?.cityName || "" });
    setEditingCityNameInput(branch.city?.cityName || "");
  };

  const handleDeleteBranchClick = async (branchId) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/admin/branches/${branchId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setError("");
        fetchBranches();
      } catch (err) {
        console.error("Error deleting branch:", err);
        setError("Failed to delete branch: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) {
    return (
      <div className="container text-center mt-4">Loading company details...</div>
    );
  }

  if (!company) {
    return (
      <div className="container text-center mt-4 text-danger">Company not found or failed to load.</div>
    );
  }

  return (
    <div className="card">
      <h2 className="mb-4">Company Details: {company.companyName}</h2>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      {/* Company Details Display */}
      <div className="mb-4 p-3 border rounded">
        <p><strong>Code:</strong> {company.companyCode}</p>
        <p><strong>Address:</strong> {company.address}, {company.city?.cityName || 'N/A'}, {company.city?.state?.stateName || 'N/A'}, {company.city?.state?.country?.countryName || 'N/A'}</p>
        <p><strong>Phone:</strong> {company.phone || 'N/A'}</p>
        <p><strong>Email:</strong> {company.email || 'N/A'}</p>
        <p><strong>Website:</strong> {company.website || 'N/A'}</p>
        <p><strong>Tax ID:</strong> {company.taxId || 'N/A'}</p>
        <p><strong>PAN:</strong> {company.pan || 'N/A'}</p>
        <p><strong>GST:</strong> {company.gst || 'N/A'}</p>
        <button 
            className="btn btn-secondary btn-sm me-2"
            // onClick={() => handleEditCompanyClick(company)} // Placeholder for company edit
            disabled // Disable for now, focus on branches
        >
            Edit Company Details
        </button>
      </div>

      <hr className="my-4" />

      {/* Branch Management Section */}
      <h3 className="mb-3">
        {editingBranch ? "Edit Branch" : `Office Locations (Branches) for ${company.companyName}`}
        {!editingBranch && (
          <button 
            className="btn btn-sm btn-outline-primary ms-3"
            onClick={() => setShowAddBranchForm(!showAddBranchForm)}
          >
            {showAddBranchForm ? "Hide Add Locations" : "Show Add Locations"}
          </button>
        )}
      </h3>

      {/* Add/Edit Branch Form */}
      {(showAddBranchForm || editingBranch) && (
        <form onSubmit={handleAddOrUpdateBranch} className="mb-4">
          {!editingBranch && (
            <div className="form-group mb-3">
              <label className="mb-1">Number of Branches to Add</label>
              <input
                type="number"
                className="form-control"
                value={numBranchesToAdd}
                onChange={handleNumBranchesChange}
                min="1"
              />
            </div>
          )}

          {editingBranch ? (
            // Edit single branch form
            <div>
              <div className="form-group">
                <label className="mb-1">Branch Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="branchName"
                  value={editingBranch.branchName}
                  onChange={handleEditBranchInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="mb-1">Branch Code</label>
                <input
                  type="text"
                  className="form-control"
                  name="branchCode"
                  value={editingBranch.branchCode}
                  onChange={handleEditBranchInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="mb-1">Address</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={editingBranch.address}
                  onChange={handleEditBranchInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="mb-1">City</label>
                <div className="input-group">
                  {/* FIX: Change input/datalist to select for city selection */}
                  <select
                    className="form-control"
                    name="cityId"
                    value={editingBranch?.cityId || ''}
                    onChange={(e) => {
                      const selectedCityId = e.target.value ? parseInt(e.target.value) : null;
                      const selectedCity = cities.find(c => c.id === selectedCityId);
                      setEditingBranch(prev => ({
                        ...prev,
                        cityId: selectedCityId,
                        // FIX: Ensure cityNameInput is updated to reflect selected city
                        cityNameInput: selectedCity ? selectedCity.cityName : ''
                      }));
                    }}
                    required
                  >
                    <option value="">Select City</option>
                    {cities.filter(city => city && city.id).map(city => (
                      <option key={city.id} value={city.id}>{city.cityName}</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowCityModal(true);
                      setCreatingCityForEditingBranch(true);
                    }}
                  >
                    + Add New City
                  </button>
                </div>
                {/* Removed onBlur error message as it's for datalist input */}
              </div>
              <div className="form-group">
                <label className="mb-1">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={editingBranch.phone}
                  onChange={handleEditBranchInputChange}
                />
              </div>
              <div className="form-group">
                <label className="mb-1">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={editingBranch.email}
                  onChange={handleEditBranchInputChange}
                />
              </div>
            </div>
          ) : (
            // Add multiple branches form
            newBranches.map((branch, index) => (
              <div key={index} className="branch-input-group card mb-3 p-3">
                <h5>Branch #{index + 1}</h5>
                <div className="form-group">
                  <label className="mb-1">Branch Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="branchName"
                    value={branch.branchName}
                    onChange={(e) => handleNewBranchInputChange(index, e)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="mb-1">Branch Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="branchCode"
                    value={branch.branchCode}
                    onChange={(e) => handleNewBranchInputChange(index, e)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="mb-1">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={branch.address}
                    onChange={(e) => handleNewBranchInputChange(index, e)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="mb-1">City</label>
                  <div className="input-group">
                    {/* FIX: Change input/datalist to select for city selection */}
                    <select
                      className="form-control"
                      name="cityId"
                      value={branch.cityId || ''}
                      onChange={(e) => {
                        const selectedCityId = e.target.value ? parseInt(e.target.value) : null;
                        const selectedCity = cities.find(c => c.id === selectedCityId);
                        // FIX: Update cityId and cityNameInput for new branches array
                        const updatedBranches = [...newBranches];
                        updatedBranches[index] = {
                          ...updatedBranches[index],
                          cityId: selectedCityId,
                          cityNameInput: selectedCity ? selectedCity.cityName : ''
                        };
                        setNewBranches(updatedBranches);
                      }}
                      required
                    >
                      <option value="">Select City</option>
                      {cities.filter(city => city && city.id).map(city => (
                        <option key={city.id} value={city.id}>{city.cityName}</option>
                      ))}
                    </select>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setShowCityModal(true);
                        setCreatingCityForBranchIndex(index);
                      }}
                    >
                      + Add New City
                    </button>
                  </div>
                  {/* Removed onBlur error message as it's for datalist input */}
                </div>

                <div className="form-group">
                  <label className="mb-1">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={branch.phone}
                    onChange={(e) => handleNewBranchInputChange(index, e)}
                  />
                </div>

                <div className="form-group">
                  <label className="mb-1">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={branch.email}
                    onChange={(e) => handleNewBranchInputChange(index, e)}
                  />
                </div>
              </div>
            ))
          )}

          <button type="submit" className="btn btn-primary mt-3">
            {editingBranch ? "Update Branch" : "Add Branches"}
          </button>
          {editingBranch && (
            <button
              type="button"
              className="btn btn-secondary mt-3 ms-2"
              onClick={() => setEditingBranch(null)}
            >
              Cancel Edit
            </button>
          )}
        </form>
      )} 
        {/* FIX: Add console log to see states value before rendering NewCityModal */}
        {console.log('States passed to NewCityModal:', states)}
        {showCityModal && (
          <NewCityModal
            // FIX: Ensure states prop is always an array
            states={states || []}
            onClose={() => {
              setShowCityModal(false);
              setCreatingCityForBranchIndex(null);
              setCreatingCityForEditingBranch(false);
            }}
            onCityCreated={handleCityCreated}
          />
        )}

      <h4 className="mb-3">Existing Branches</h4>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Address</th>
              <th>City</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.length > 0 ? (
              branches.map((branch) => (
                <tr key={branch.branchId}>
                  <td>{branch.branchName}</td>
                  <td>{branch.branchCode}</td>
                  <td>{branch.address}</td>
                  <td>{branch.city?.cityName || "N/A"}</td>
                  <td>{branch.phone || "N/A"}</td>
                  <td>{branch.email || "N/A"}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm me-2"
                      onClick={() => handleEditBranchClick(branch)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteBranchClick(branch.branchId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No branches found for this company. Add your first location above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 

const NewCityModal = ({ states, onClose, onCityCreated }) => {
  // FIX: Ensure states is always an array internally, even if passed undefined
  states = states || []; 

  const [newCityName, setNewCityName] = useState("");
  const [newCityCode, setNewCityCode] = useState("");
  const [newCityStateId, setNewCityStateId] = useState("");
  const [modalError, setModalError] = useState("");

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/cities`,
        {
          cityName: newCityName,
          cityCode: newCityCode,
          stateId: parseInt(newCityStateId),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCityCreated(response.data.data);
      onClose(); // Close modal on success
    } catch (err) {
      console.error("Error creating new city:", err);
      setModalError("Failed to create city: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New City</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleModalSubmit}>
            <div className="modal-body">
              {modalError && <div className="alert alert-danger">{modalError}</div>}
              <div className="form-group mb-3">
                <label className="mb-1">City Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="mb-1">City Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={newCityCode}
                  onChange={(e) => setNewCityCode(e.target.value)}
                />
              </div>
              <div className="form-group mb-3">
                <label className="mb-1">State</label>
                <select
                  className="form-control"
                  value={newCityStateId}
                  onChange={(e) => setNewCityStateId(e.target.value)}
                  required
                >
                  <option value="">Select State</option>
                  {/* FIX: Ensure key and value use state.id in NewCityModal */}
                  {states.filter(state => state && state.id).map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.stateName} ({state.country?.countryName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
              <button type="submit" className="btn btn-primary">Create City</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 