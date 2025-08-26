import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/theme.css";

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({
    companyName: "",
    companyCode: "",
    address: "",
    cityId: null,
    cityNameInput: "", // For manual city input
    stateId: null,
    stateNameInput: "", // For manual state input
    countryId: null,
    countryNameInput: "", // For manual country input
    phone: "",
    email: "",
    website: "",
    taxId: "",
    pan: "",
    gst: "",
  });
  const [editingCompany, setEditingCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);

  // Remove all modal logic and state for showCountryModal, showStateModal, showCityModal, etc.
  // Add state for branches and branch toggle
  const [addBranches, setAddBranches] = useState(false);
  const [branches, setBranches] = useState([]);

  // To track which input triggered the modal (not strictly needed for CompanyManagement, but good for consistency)
  const [creatingForInput, setCreatingForInput] = useState(null); // 'country', 'state', 'city'

  // Add state for showing inline add forms
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [showAddState, setShowAddState] = useState(false);
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");
  const [newCountryCode, setNewCountryCode] = useState("");
  const [newStateName, setNewStateName] = useState("");
  const [newStateCode, setNewStateCode] = useState("");
  const [newCityName, setNewCityName] = useState("");
  const [newCityCode, setNewCityCode] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
    fetchCountries();
  }, []);

  // Effect to fetch states when countryId changes in newCompany form
  useEffect(() => {
    if (newCompany.countryId) {
      fetchStates(newCompany.countryId);
    } else {
      setStates([]); // Clear states if no country selected
      setNewCompany(prev => ({ ...prev, stateId: null, stateNameInput: "", cityId: null, cityNameInput: "" }));
    }
  }, [newCompany.countryId]);

  // Effect to fetch cities when stateId changes in newCompany form
  useEffect(() => {
    if (newCompany.stateId) {
      fetchCities(newCompany.stateId);
    } else {
      setCities([]); // Clear cities if no state selected
      setNewCompany(prev => ({ ...prev, cityId: null, cityNameInput: "" }));
    }
  }, [newCompany.stateId]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/companies`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // FIX: Ensure companies is always set to an array to prevent .map errors
      setCompanies(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      setError("Failed to fetch companies.");
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/countries`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // FIX: Ensure countries is always set to an array
      setCountries(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch countries:", err);
      setError("Failed to fetch countries for company creation.");
    }
  };

  const fetchStates = async (countryId) => {
    try {
      // FIX: Ensure a valid, numeric countryId is passed before fetching
      if (!countryId || isNaN(parseInt(countryId))) {
        setStates([]); // Clear states if countryId is invalid
        return;
      }
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/states?countryId=${countryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStates(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch states:", err);
      // More specific error message
      const message = err.response?.data?.message || "An unexpected error occurred.";
      setError(`Failed to fetch states: ${message}`);
    }
  };

  const fetchCities = async (stateId) => {
    try {
      // FIX: Ensure a valid, numeric stateId is passed before fetching
      if (!stateId || isNaN(parseInt(stateId))) {
        setCities([]); // Clear cities if stateId is invalid
        return;
      }
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/cities?stateId=${stateId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCities(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch cities:", err);
      setError("Failed to fetch cities for company creation.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingCompany) {
      setEditingCompany({ ...editingCompany, [name]: value });
    } else {
      let updatedNewCompany = { ...newCompany, [name]: value };
      
      // Clear dependent fields if parent changes via manual input
      if (name === "countryNameInput") {
        updatedNewCompany = { ...updatedNewCompany, countryId: null, stateId: null, stateNameInput: "", cityId: null, cityNameInput: "" };
        setStates([]);
        setCities([]);
      } else if (name === "stateNameInput") {
        updatedNewCompany = { ...updatedNewCompany, stateId: null, cityId: null, cityNameInput: "" };
        setCities([]);
      } else if (name === "cityNameInput") {
        updatedNewCompany = { ...updatedNewCompany, cityId: null };
      }

      setNewCompany(updatedNewCompany);
    }
  };

  const handleSelectCountry = (country) => {
    // FIX: Use country.id to populate countryId in state
    setNewCompany(prev => ({ ...prev, countryId: country.id, countryNameInput: country.countryName }));
    fetchStates(country.id); // Fetch states for the selected country
  };

  const handleSelectState = (state) => {
    // FIX: Use state.id to populate stateId in state
    setNewCompany(prev => ({ ...prev, stateId: state.id, stateNameInput: state.stateName }));
    fetchCities(state.id); // Fetch cities for the selected state
  };

  const handleSelectCity = (city) => {
    // FIX: Use city.id to populate cityId in state
    setNewCompany(prev => ({ ...prev, cityId: city.id, cityNameInput: city.cityName }));
  };

  const handleCountryCreated = (newCountry) => {
    fetchCountries(); // Refresh countries list
    // FIX: Use newCountry.id to populate countryId in state
    setNewCompany(prev => ({ ...prev, countryId: newCountry.id, countryNameInput: newCountry.countryName }));
    setShowCountryModal(false);
  };

  const handleStateCreated = (newState) => {
    fetchStates(newCompany.countryId); // Refresh states list for current country
    // FIX: Use newState.id to populate stateId in state
    setNewCompany(prev => ({ ...prev, stateId: newState.id, stateNameInput: newState.stateName }));
    setShowStateModal(false);
  };

  const handleCityCreated = (newCity) => {
    fetchCities(newCompany.stateId); // Refresh cities list for current state
    // FIX: Use newCity.id to populate cityId in state
    setNewCompany(prev => ({ ...prev, cityId: newCity.id, cityNameInput: newCity.cityName }));
    setShowCityModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editingCompany) {
        // If editing company, ensure valid location is selected
        if (!editingCompany.countryId || !editingCompany.stateId || !editingCompany.cityId) {
          setError("Please select a valid Country, State, and City for the company.");
          return;
        }
        await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/companies/${editingCompany.companyId}`,
          editingCompany,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setError("");
        setEditingCompany(null);
      } else {
        if (!newCompany.countryId || !newCompany.stateId || !newCompany.cityId) {
          setError("Please select a valid Country, State, and City.");
          return;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/companies`,
          newCompany,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setError("");
        setNewCompany({
          companyName: "",
          companyCode: "",
          address: "",
          cityId: null,
          cityNameInput: "",
          stateId: null,
          stateNameInput: "",
          countryId: null,
          countryNameInput: "",
          phone: "",
          email: "",
          website: "",
          taxId: "",
          pan: "",
          gst: "",
        });
        navigate(`/admin/companies/${response.data.data.companyId}`);
      }
      fetchCompanies();
    } catch (err) {
      console.error("Error saving company:", err);
      // FIX: Improved error handling for unique constraint violations
      if (err.response && err.response.data && err.response.data.message) {
        if (err.response.data.message.includes('Duplicate')) {
          setError("Failed to save company: " + err.response.data.message);
        } else {
          setError("Failed to save company: " + err.response.data.message);
        }
      } else {
        setError("Failed to save company: An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleEditClick = (company) => {
    setEditingCompany({ 
      ...company,
      countryNameInput: company.city?.state?.country?.countryName || "",
      stateNameInput: company.city?.state?.stateName || "",
      cityNameInput: company.city?.cityName || ""
    });
    // Also fetch dependent data for editing
    // FIX: Use .id for nested objects from API response when fetching dependent data
    if (company.city?.state?.country?.id) fetchStates(company.city.state.country.id);
    if (company.city?.state?.id) fetchCities(company.city.state.id);
  };

  const handleDeleteClick = async (companyId) => {
    if (window.confirm("Are you sure you want to delete this company? This will also affect associated branches and employees.")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/admin/companies/${companyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setError("");
        fetchCompanies();
      } catch (err) {
        console.error("Error deleting company:", err);
        setError("Failed to delete company: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) {
    return (
      <div className="container text-center mt-4">Loading companies...</div>
    );
  }

  return (
    <div className="card">
      <h2 className="mb-4">{editingCompany ? "Edit Company" : "Add New Company"}</h2>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-4">
        {/* Company Name, Code, Address */}
        <div className="form-group">
          <label className="mb-1">Company Name</label>
          <input
            type="text"
            className="form-control"
            name="companyName"
            value={editingCompany ? editingCompany.companyName : newCompany.companyName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="mb-1">Company Code</label>
          <input
            type="text"
            className="form-control"
            name="companyCode"
            value={editingCompany ? editingCompany.companyCode : newCompany.companyCode}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="mb-1">Address</label>
          <input
            type="text"
            className="form-control"
            name="address"
            value={editingCompany ? editingCompany.address : newCompany.address}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Country Input */}
        <div className="form-group">
          <label className="mb-1">Country</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              className="form-control"
              value={newCompany.countryId || ''}
              onChange={e => {
                // FIX: Ensure countryId is a number and reset dependent fields
                const countryId = e.target.value ? parseInt(e.target.value) : null;
                const country = countries.find(c => c.id === countryId);
                
                setNewCompany(prev => ({ 
                  ...prev, 
                  countryId, 
                  countryNameInput: country ? country.countryName : '', 
                  stateId: null, // Reset state
                  stateNameInput: '', 
                  cityId: null, // Reset city
                  cityNameInput: '' 
                }));

                if (countryId) {
                  fetchStates(countryId);
                } else {
                  setStates([]); // Clear states dropdown
                  setCities([]); // Clear cities dropdown
                }
              }}
              required
            >
              <option value="">Select Country</option>
              {/* FIX: Filter out invalid data to prevent unique key errors */}
              {countries && countries.filter(c => c && c.id).map(country => (
                <option key={`country-${country.id}`} value={country.id}>{country.countryName}</option>
              ))}
            </select>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAddCountry(v => !v)}>+ Add New</button>
          </div>
          {showAddCountry && (
            <div className="mt-2" style={{ display: 'flex', gap: 8 }}>
              <input type="text" className="form-control" placeholder="Country Name" value={newCountryName} onChange={e => setNewCountryName(e.target.value)} required />
              <input type="text" className="form-control" placeholder="Country Code" value={newCountryCode} onChange={e => setNewCountryCode(e.target.value)} required />
              <button type="button" className="btn btn-success btn-sm" onClick={async () => {
                const token = localStorage.getItem("token");
                try {
                  const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/countries`, { countryName: newCountryName, countryCode: newCountryCode }, { headers: { Authorization: `Bearer ${token}` } });
                  await fetchCountries();
                  // FIX: Use res.data.data.id for countryId
                  setNewCompany(prev => ({ ...prev, countryId: res.data.data.id, countryNameInput: res.data.data.countryName, stateId: null, stateNameInput: '', cityId: null, cityNameInput: '' }));
                  setShowAddCountry(false); setNewCountryName(""); setNewCountryCode("");
                } catch (err) { setError("Failed to add country: " + (err.response?.data?.message || err.message)); }
              }}>Save</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setShowAddCountry(false); setNewCountryName(""); setNewCountryCode(""); }}>Cancel</button>
            </div>
          )}
        </div>

        {/* State Input */}
        <div className="form-group">
          <label className="mb-1">State</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              className="form-control"
              value={newCompany.stateId || ''}
              onChange={e => {
                // FIX: Ensure stateId is a number and reset city
                const stateId = e.target.value ? parseInt(e.target.value) : null;
                const state = states.find(s => s.id === stateId);
                
                setNewCompany(prev => ({ 
                  ...prev, 
                  stateId, 
                  stateNameInput: state ? state.stateName : '',
                  cityId: null, // Reset city
                  cityNameInput: ''
                }));

                if (stateId) {
                  fetchCities(stateId);
                } else {
                  setCities([]); // Clear cities dropdown
                }
              }}
              required
              disabled={!newCompany.countryId}
            >
              <option value="">Select State</option>
              {/* FIX: Filter out invalid data to prevent unique key errors */}
              {states && states.filter(s => s && s.id).map(state => (
                <option key={`state-${state.id}`} value={state.id}>{state.stateName}</option>
              ))}
            </select>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAddState(v => !v)} disabled={!newCompany.countryId}>+ Add New</button>
          </div>
          {showAddState && (
            <div className="mt-2" style={{ display: 'flex', gap: 8 }}>
              <input type="text" className="form-control" placeholder="State Name" value={newStateName} onChange={e => setNewStateName(e.target.value)} required />
              <input type="text" className="form-control" placeholder="State Code" value={newStateCode} onChange={e => setNewStateCode(e.target.value)} />
              <button type="button" className="btn btn-success btn-sm" onClick={async () => {
                const token = localStorage.getItem("token");
                try {
                  // FIX: Ensure countryId is sent as a number and is valid
                  if (!newCompany.countryId) {
                    setError("A country must be selected to add a new state.");
                    return;
                  }
                  const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/states`, { stateName: newStateName, stateCode: newStateCode, countryId: parseInt(newCompany.countryId) }, { headers: { Authorization: `Bearer ${token}` } });
                  await fetchStates(newCompany.countryId);
                  // FIX: Use res.data.data.id for stateId
                  setNewCompany(prev => ({ ...prev, stateId: res.data.data.id, stateNameInput: res.data.data.stateName, cityId: null, cityNameInput: '' }));
                  setShowAddState(false); setNewStateName(""); setNewStateCode("");
                } catch (err) { setError("Failed to add state: " + (err.response?.data?.message || err.message)); }
              }}>Save</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setShowAddState(false); setNewStateName(""); setNewStateCode(""); }}>Cancel</button>
            </div>
          )}
        </div>

        {/* City Input */}
        <div className="form-group">
          <label className="mb-1">City</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              className="form-control"
              value={newCompany.cityId || ''}
              onChange={e => {
                // FIX: Ensure cityId is a number
                const cityId = e.target.value ? parseInt(e.target.value) : null;
                const city = cities.find(c => c.id === cityId);
                setNewCompany(prev => ({ ...prev, cityId, cityNameInput: city ? city.cityName : '' }));
              }}
              required
              disabled={!newCompany.stateId}
            >
              <option value="">Select City</option>
              {/* FIX: Filter out invalid data to prevent unique key errors */}
              {cities && cities.filter(c => c && c.id).map(city => (
                <option key={`city-${city.id}`} value={city.id}>{city.cityName}</option>
              ))}
            </select>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAddCity(v => !v)} disabled={!newCompany.stateId}>+ Add New</button>
          </div>
          {showAddCity && (
            <div className="mt-2" style={{ display: 'flex', gap: 8 }}>
              <input type="text" className="form-control" placeholder="City Name" value={newCityName} onChange={e => setNewCityName(e.target.value)} required />
              <input type="text" className="form-control" placeholder="City Code" value={newCityCode} onChange={e => setNewCityCode(e.target.value)} />
              <button type="button" className="btn btn-success btn-sm" onClick={async () => {
                const token = localStorage.getItem("token");
                try {
                  const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/cities`, { cityName: newCityName, cityCode: newCityCode, stateId: newCompany.stateId }, { headers: { Authorization: `Bearer ${token}` } });
                  await fetchCities(newCompany.stateId);
                  // FIX: Use res.data.data.id for cityId
                  setNewCompany(prev => ({ ...prev, cityId: res.data.data.id, cityNameInput: res.data.data.cityName }));
                  setShowAddCity(false); setNewCityName(""); setNewCityCode("");
                } catch (err) { setError("Failed to add city: " + (err.response?.data?.message || err.message)); }
              }}>Save</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setShowAddCity(false); setNewCityName(""); setNewCityCode(""); }}>Cancel</button>
            </div>
          )}
        </div>

        {/* Add Branches */}
        <div className="form-group">
          <label className="mb-1">Add Branches?</label>
          <select
            className="form-control"
            value={addBranches ? 'yes' : 'no'}
            onChange={e => setAddBranches(e.target.value === 'yes')}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        {addBranches && (
          <div>
            <button type="button" className="btn btn-outline-primary mb-2" onClick={() => setBranches([...branches, { branchName: '', branchCode: '', address: '', stateName: '', cityName: '', phone: '', email: '', isHeadOffice: false }])}>
              + Add Branch
            </button>
            {branches.map((branch, idx) => (
              // FIX: Use a more robust unique key using a prefix
              <div key={`branch-${idx}`} className="card p-2 mb-2">
                <div className="form-group">
                  <label>Branch Name</label>
                  <input type="text" className="form-control" value={branch.branchName} onChange={e => {
                    const updated = [...branches];
                    updated[idx].branchName = e.target.value;
                    setBranches(updated);
                  }} required />
                </div>
                <div className="form-group">
                  <label>Branch Code</label>
                  <input type="text" className="form-control" value={branch.branchCode} onChange={e => {
                    const updated = [...branches];
                    updated[idx].branchCode = e.target.value;
                    setBranches(updated);
                  }} required />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" className="form-control" value={branch.address} onChange={e => {
                    const updated = [...branches];
                    updated[idx].address = e.target.value;
                    setBranches(updated);
                  }} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" className="form-control" value={branch.stateName} onChange={e => {
                    const updated = [...branches];
                    updated[idx].stateName = e.target.value;
                    setBranches(updated);
                  }} required />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" className="form-control" value={branch.cityName} onChange={e => {
                    const updated = [...branches];
                    updated[idx].cityName = e.target.value;
                    setBranches(updated);
                  }} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" className="form-control" value={branch.phone} onChange={e => {
                    const updated = [...branches];
                    updated[idx].phone = e.target.value;
                    setBranches(updated);
                  }} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" value={branch.email} onChange={e => {
                    const updated = [...branches];
                    updated[idx].email = e.target.value;
                    setBranches(updated);
                  }} />
                </div>
                <div className="form-group">
                  <label>Is Head Office?</label>
                  <input type="checkbox" checked={branch.isHeadOffice} onChange={e => {
                    const updated = [...branches];
                    updated[idx].isHeadOffice = e.target.checked;
                    setBranches(updated);
                  }} />
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => setBranches(branches.filter((_, i) => i !== idx))}>Remove Branch</button>
              </div>
            ))}
          </div>
        )}

        {/* Phone, Email, Website, Tax ID, PAN, GST */}
        <div className="form-group">
          <label className="mb-1">Phone</label>
          <input
            type="text"
            className="form-control"
            name="phone"
            value={editingCompany ? editingCompany.phone : newCompany.phone}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label className="mb-1">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={editingCompany ? editingCompany.email : newCompany.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label className="mb-1">Website</label>
          <input
            type="text"
            className="form-control"
            name="website"
            value={editingCompany ? editingCompany.website : newCompany.website}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label className="mb-1">Tax ID</label>
          <input
            type="text"
            className="form-control"
            name="taxId"
            value={editingCompany ? editingCompany.taxId : newCompany.taxId}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label className="mb-1">PAN</label>
          <input
            type="text"
            className="form-control"
            name="pan"
            value={editingCompany ? editingCompany.pan : newCompany.pan}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label className="mb-1">GST</label>
          <input
            type="text"
            className="form-control"
            name="gst"
            value={editingCompany ? editingCompany.gst : newCompany.gst}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" className="btn btn-primary mt-3">
          {editingCompany ? "Update Company" : "Add Company"}
        </button>
        {editingCompany && (
          <button
            type="button"
            className="btn btn-secondary mt-3 ms-2"
            onClick={() => setEditingCompany(null)}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <h3 className="mb-3">Existing Companies</h3>
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
              <th>Website</th>
              <th>Tax ID</th>
              <th>PAN</th>
              <th>GST</th>
              <th>Is Active</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.length > 0 ? (
              // FIX: Filter out invalid data to prevent unique key errors
              companies.filter(company => company && company.id).map((company) => (
                <tr key={`company-${company.id}`}>
                  <td>{company.companyName}</td>
                  <td>{company.companyCode}</td>
                  <td>{company.address}</td>
                  <td>{company.city?.cityName || "N/A"}</td>
                  <td>{company.phone || "N/A"}</td>
                  <td>{company.email || "N/A"}</td>
                  <td>{company.website || "N/A"}</td>
                  <td>{company.taxId || "N/A"}</td>
                  <td>{company.pan || "N/A"}</td>
                  <td>{company.gst || "N/A"}</td>
                  <td>{company.isActive ? "Yes" : "No"}</td>
                  <td>{new Date(company.createdDate).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm me-2"
                      onClick={() => handleEditClick(company)}
                    >
                      Edit
                    </button>
                    <Link to={`/admin/companies/${company.id}`} className="btn btn-info btn-sm me-2">
                      View Details
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      // FIX: Ensure company.id is passed to handleDeleteClick
                      onClick={() => handleDeleteClick(company.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center">
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals for adding Country, State, City */}
      {/* Removed all modal components */}
    </div>
  );
}

// New inline components for Modals
const NewCountryModal = ({ onClose, onCountryCreated }) => {
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [modalError, setModalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/countries`,
        { countryName, countryCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCountryCreated(response.data.data);
    } catch (err) {
      console.error("Error creating country:", err);
      setModalError("Failed to create country: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Country</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {modalError && <div className="alert alert-danger">{modalError}</div>}
              <div className="form-group mb-3">
                <label className="mb-1">Country Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={countryName}
                  onChange={(e) => setCountryName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="mb-1">Country Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
              <button type="submit" className="btn btn-primary">Create Country</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const NewStateModal = ({ countries, onClose, onStateCreated }) => {
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [countryId, setCountryId] = useState("");
  const [modalError, setModalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/states`,
        { stateName, stateCode, countryId: parseInt(countryId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onStateCreated(response.data.data);
    } catch (err) {
      console.error("Error creating state:", err);
      setModalError("Failed to create state: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New State</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {modalError && <div className="alert alert-danger">{modalError}</div>}
              <div className="form-group mb-3">
                <label className="mb-1">State Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="mb-1">State Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                />
              </div>
              <div className="form-group mb-3">
                <label className="mb-1">Country</label>
                <select
                  className="form-control"
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value)}
                  required
                >
                  <option value="">Select Country</option>
                  {/* FIX: Filter out invalid data to prevent unique key errors */}
                  {countries && countries.filter(c => c && c.id).map((country) => (
                    <option key={`modal-country-${country.id}`} value={country.id}>
                      {country.countryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
              <button type="submit" className="btn btn-primary">Create State</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const NewCityModal = ({ states, onClose, onCityCreated }) => {
  const [cityName, setCityName] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [stateId, setStateId] = useState("");
  const [modalError, setModalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/cities`,
        { cityName, cityCode, stateId: parseInt(stateId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCityCreated(response.data.data);
    } catch (err) {
      console.error("Error creating city:", err);
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
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {modalError && <div className="alert alert-danger">{modalError}</div>}
              <div className="form-group mb-3">
                <label className="mb-1">City Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="mb-1">City Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={cityCode}
                  onChange={(e) => setCityCode(e.target.value)}
                />
              </div>
              <div className="form-group mb-3">
                <label className="mb-1">State</label>
                <select
                  className="form-control"
                  value={stateId}
                  onChange={(e) => setStateId(e.target.value)}
                  required
                >
                  <option value="">Select State</option>
                  {/* FIX: Filter out invalid data to prevent unique key errors */}
                  {states && states.filter(s => s && s.id).map((state) => (
                    <option key={`modal-state-${state.id}`} value={state.id}>
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