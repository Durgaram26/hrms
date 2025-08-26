import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // Import Leaflet for default icon workaround

// Fix for default icon issue with Leaflet and Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Helper component to programmatically update the map's view
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Helper component for map events to avoid `whenCreated`
function MapEvents({ onMapClick }) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

export default function LocationSettings() {
  const [geofences, setGeofences] = useState([]);
  const [newGeoFence, setNewGeoFence] = useState({
    geoFenceName: "",
    branchId: null, // FIX: Initialize branchId to null, not 1
    latitude: 0,
    longitude: 0,
    radiusMeters: 100, // Default radius in meters
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null); // To center map
  const [branches, setBranches] = useState([]); // To fetch branches for dropdown

  const markerRef = useRef(null); // Ref for the draggable marker

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setNewGeoFence((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));
        }
      },
    }),
    [],
  );

  useEffect(() => {
    console.log("useEffect: Initializing data fetch.");
    getUserLocation();
    fetchBranches();
  }, []);

  useEffect(() => {
    console.log("useEffect [branchId]: newGeoFence.branchId changed to", newGeoFence.branchId);
    // FIX: Only fetch geofences if a valid, non-null, non-zero branchId is set
    if (newGeoFence.branchId && newGeoFence.branchId !== 0) {
      fetchGeofences(newGeoFence.branchId);
    } else {
      console.log("Branch ID is invalid or not set, not fetching geofences.");
      setGeofences([]); // FIX: Clear geofences if no valid branchId
      setLoading(false); // Stop loading if no valid branchId is set
    }
  }, [newGeoFence.branchId]);

  const getUserLocation = () => {
    console.log("Attempting to get user location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Geolocation success:", position.coords.latitude, position.coords.longitude);
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setNewGeoFence((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (err) => {
          console.error("Error getting user location:", err);
          // Default to a central location if geo-location fails
          const defaultLoc = { latitude: 20.5937, longitude: 78.9629 }; // Center of India
          setUserLocation(defaultLoc);
          setNewGeoFence((prev) => ({
            ...prev,
            latitude: defaultLoc.latitude,
            longitude: defaultLoc.longitude,
          }));
          setError("Could not get current location. Defaulting to India center.");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      const defaultLoc = { latitude: 20.5937, longitude: 78.9629 }; // Center of India
      setUserLocation(defaultLoc);
      setNewGeoFence((prev) => ({
        ...prev,
        latitude: defaultLoc.latitude,
        longitude: defaultLoc.longitude,
      }));
      setError("Geolocation not supported. Defaulting to India center.");
    }
  };

  const fetchBranches = async () => {
    console.log("Fetching branches...");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found for fetching branches.");
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/branches`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Branches fetched successfully:", response.data.data);
      // FIX: Ensure branches array is set, and set default branchId using `id`
      const fetchedBranches = response.data.data || [];
      setBranches(fetchedBranches);
      if (fetchedBranches.length > 0) {
        setNewGeoFence((prev) => ({
          ...prev,
          branchId: fetchedBranches[0].id, // FIX: Use .id for consistency
        }));
      } else {
        setError("No branches found. Please add a branch first.");
        setNewGeoFence((prev) => ({ ...prev, branchId: null })); // FIX: Set to null if no branches
      }
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setError("Failed to fetch branches");
      setLoading(false);
    }
  };

  const fetchGeofences = async (branchIdToFetch) => {
    console.log("Fetching geofences for branchId:", branchIdToFetch);
    if (!branchIdToFetch || branchIdToFetch === 0) {
      console.log("Invalid branchId for fetching geofences.");
      setGeofences([]); // Clear geofences if no valid branch is selected
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found for fetching geofences.");
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/attendance/geofences/${branchIdToFetch}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Geofences fetched successfully:", response.data.data);
      setGeofences(response.data.data || []); // FIX: Ensure geofences is an array
      setLoading(false);
    } catch (err) {
      console.error("Error fetching geofences:", err);
      setError("Failed to fetch geofences. Make sure the selected branch has geofences or the API is reachable.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting new geo-fence:", newGeoFence);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }
      // FIX: Validate all required fields for geo-fence creation on frontend
      if (!newGeoFence.geoFenceName || !newGeoFence.branchId || newGeoFence.latitude === 0 || newGeoFence.longitude === 0 || newGeoFence.radiusMeters === 0) {
        setError("All geo-fence fields (Name, Branch, Coordinates, Radius) are required and must be valid.");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/geofences`,
        newGeoFence,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Geo-fence added successfully.");
      fetchGeofences(newGeoFence.branchId); // Refresh list for the current branch
      setNewGeoFence({
        geoFenceName: "",
        branchId: newGeoFence.branchId, // Keep selected branch
        latitude: userLocation ? userLocation.latitude : 0,
        longitude: userLocation ? userLocation.longitude : 0,
        radiusMeters: 100,
      });
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error adding geo-fence:", err.response?.data?.message || err.message);
      setError("Failed to add geo-fence: " + (err.response?.data?.message || err.message));
    }
  };

  const handleMapClick = (e) => {
    console.log("Map clicked at:", e.latlng.lat, e.latlng.lng);
    setNewGeoFence((prev) => ({
      ...prev,
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
    }));
  };

  const handleManualCoordinateChange = (e) => {
    const { name, value } = e.target;
    console.log(`Manual input change for ${name}: ${value}`);
    setNewGeoFence((prev) => ({ 
      ...prev, 
      [name]: parseFloat(value) || 0 // Ensure it's a number
    }));
  };

  const handleDeleteGeofence = async (geoFenceId) => {
    console.log("Attempting to delete geo-fence:", geoFenceId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/geofences/${geoFenceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Geo-fence deleted successfully.");
      fetchGeofences(newGeoFence.branchId); // Refresh list for the current branch
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error deleting geo-fence:", err.response?.data?.message || err.message);
      setError("Failed to delete geo-fence: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading || !userLocation) {
    return (
      <div className="container text-center mt-4">Loading Map and Data...</div>
    );
  }

  return (
    <div className="card">
      <h2 className="mb-4">Geo-fence Management</h2>

      {/* Add New Geo-fence Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <label className="mb-1">Geo-fence Name</label>
          <input
            type="text"
            className="form-control"
            value={newGeoFence.geoFenceName}
            onChange={(e) =>
              setNewGeoFence({ ...newGeoFence, geoFenceName: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label className="mb-1">Branch</label>
          <select
            className="form-control"
            value={newGeoFence.branchId || ''} // FIX: Use || '' for initial render safety
            onChange={(e) =>
              setNewGeoFence({ ...newGeoFence, branchId: parseInt(e.target.value) })
            }
            required
          >
            {branches.length > 0 ? (
              branches.map((branch) => (
                // FIX: Use branch.id for key and value
                <option key={`branch-${branch.id}`} value={branch.id}>
                  {branch.branchName}
                </option>
              ))
            ) : (
              // FIX: Indicate no branches are available and disable selection
              <option value="" disabled>No Branches Available</option>
            )}
          </select>
          {branches.length === 0 && (
            <small className="text-danger">Please create a branch in Company Management first.</small>
          )}
        </div>

        {/* Manual Latitude and Longitude Inputs */}
        <div className="form-group">
          <label className="mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            className="form-control"
            name="latitude"
            value={newGeoFence.latitude}
            onChange={handleManualCoordinateChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            className="form-control"
            name="longitude"
            value={newGeoFence.longitude}
            onChange={handleManualCoordinateChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="mb-1">Radius (meters): {newGeoFence.radiusMeters}</label>
          <input
            type="range"
            className="form-range"
            min="10"
            max="1000"
            step="10"
            value={newGeoFence.radiusMeters}
            onChange={(e) =>
              setNewGeoFence({ ...newGeoFence, radiusMeters: parseInt(e.target.value) })
            }
          />
        </div>

        <div style={{ height: "400px", width: "100%", marginBottom: "20px" }}>
          <MapContainer
            center={[userLocation?.latitude || 20.5937, userLocation?.longitude || 78.9629]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <ChangeView center={userLocation ? [userLocation.latitude, userLocation.longitude] : null} zoom={15} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapEvents onMapClick={handleMapClick} />
            {newGeoFence.latitude !== 0 && newGeoFence.longitude !== 0 && (
              <>
                <Marker 
                  position={[newGeoFence.latitude, newGeoFence.longitude]}
                  draggable={true}
                  eventHandlers={eventHandlers}
                  ref={markerRef}
                />
                <Circle
                  center={[newGeoFence.latitude, newGeoFence.longitude]}
                  radius={newGeoFence.radiusMeters}
                  color="blue"
                  fillColor="#30f"
                  fillOpacity={0.2}
                />
              </>
            )}
          </MapContainer>
          {/* FIX: Add Get Current Location button */}
          <button type="button" className="btn btn-secondary mt-2" onClick={getUserLocation}>
            Get Current Location
          </button>
        </div>

        <button type="submit" className="btn btn-primary">
          Add Geo-fence
        </button>
      </form>

      {error && <div className="text-danger mb-3">{error}</div>}

      {/* Geo-fences List */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Branch</th>
              <th>Coordinates</th>
              <th>Radius</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {geofences.map((geoFence) => (
              // FIX: Use geoFence.id for key if available, otherwise geoFence.geoFenceId
              <tr key={geoFence.id || geoFence.geoFenceId}><td>{geoFence.geoFenceName}</td><td>{geoFence.branch?.branchName || 'N/A'}</td> {/* Display branch name */}<td><a
                    href={`https://www.google.com/maps?q=${geoFence.latitude},${geoFence.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {geoFence.latitude}, {geoFence.longitude}
                  </a></td><td>{geoFence.radiusMeters}m</td><td><button className="btn btn-secondary btn-sm me-2">Edit</button><button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteGeofence(geoFence.id || geoFence.geoFenceId)}
                  >
                    Delete
                  </button></td></tr>
            ))}
            {geofences.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="text-center">No geo-fences found for the selected branch.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 