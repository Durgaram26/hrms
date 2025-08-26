import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import moment from 'moment';

// Fix for default marker icon issue with Webpack/Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom red icon for office location
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const AttendanceBoard = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [geofences, setGeofences] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [geoFenceMessage, setGeoFenceMessage] = useState('');
  const [map, setMap] = useState(null);
  const [hasEmployeeProfile, setHasEmployeeProfile] = useState(true); // New state to track if employee profile exists
  
  // New state for manual attendance submission
  const [attendanceDate, setAttendanceDate] = useState(moment().format('YYYY-MM-DD'));
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [isClockedIn, setIsClockedIn] = useState(false); // To track if the user has clocked in today

  useEffect(() => {
    getUserLocationAndFetchStatus();
  }, []);

  useEffect(() => {
    if (attendanceStatus?.clockIn && !attendanceStatus?.clockOut) {
      setIsClockedIn(true);
    } else {
      setIsClockedIn(false);
    }
  }, [attendanceStatus]);

  useEffect(() => {
    if (!map) return;

    const featureGroup = L.featureGroup();

    if (userLocation) {
      L.marker([userLocation.latitude, userLocation.longitude]).addTo(featureGroup);
    }

    if (geofences && geofences.length > 0) {
      geofences.forEach(fence => {
        const lat = parseFloat(fence.latitude);
        const lng = parseFloat(fence.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          const center = [lat, lng];
          const radius = Number(fence.radiusMeters) || 0;
          L.circle(center, { radius }).addTo(featureGroup);
        }
      });
    }

    if (featureGroup.getLayers().length > 0) {
      const bounds = featureGroup.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, userLocation, geofences]);

  const getUserLocationAndFetchStatus = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(location);
          fetchInitialData(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          setMessage("Could not retrieve your location. Please enable location services.");
          fetchInitialData(null);
        }
      );
    } else {
      setMessage("Geolocation is not supported by your browser.");
      fetchInitialData(null);
    }
  };

  const fetchInitialData = async (location) => {
    setLoading(true);
    setMessage('');
    setGeoFenceMessage('');

    try {
      const token = localStorage.getItem("token");
      let url = `${import.meta.env.VITE_API_URL}/attendance/status`;
      if (location) {
        url += `?latitude=${location.latitude}&longitude=${location.longitude}`;
      }
      
      const statusResponse = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setAttendanceStatus(statusResponse.data.data.attendance);
      setGeoFenceMessage(statusResponse.data.data.geoFenceMessage);

      const employeeProfileResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/employees/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const profile = employeeProfileResponse.data.data;
      setEmployeeProfile(profile);
      
      if (profile?.branch?.id) {
        await fetchGeofences(profile.branch.id);
        setHasEmployeeProfile(true);
      } else {
        setMessage("Your employee profile is not assigned to a branch, or no branch is associated. Please contact an administrator.");
        setHasEmployeeProfile(false);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      // Check if the error is due to missing employee profile
      if (error.response?.status === 404 && error.response?.data?.message === "Employee not found") {
        setMessage("No employee profile found for your user. Please contact an administrator.");
        setHasEmployeeProfile(false);
      } else if (error.response?.data?.message === "No employee profile associated with this user") {
        setMessage("No employee profile found for your user. Please contact an administrator.");
        setHasEmployeeProfile(false);
      } else {
        setMessage(error.response?.data?.message || 'Failed to load initial attendance data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGeofences = async (branchId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/attendance/geofences/${branchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGeofences(response.data.data || []);
    } catch (error) {
      console.error('Error fetching geofences:', error);
      setMessage('Failed to load geofence data.');
    }
  };

  const handleClockInClick = () => {
    const now = moment();
    setAttendanceDate(now.format('YYYY-MM-DD'));
    setClockInTime(now.format('HH:mm'));
    setClockOutTime(''); // Clear clock out time
  };

  const handleClockOutClick = () => {
    const now = moment();
    setClockOutTime(now.format('HH:mm'));
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!userLocation) {
      setMessage("Please enable location services and refresh to submit attendance.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/attendance/submit`,
        {
          date: attendanceDate,
          clockInTime,
          clockOutTime,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          location: `Lat: ${userLocation.latitude}, Lon: ${userLocation.longitude}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setAttendanceStatus(response.data.data);
      // Clear form after successful submission if clock out is also done
      if (clockInTime && clockOutTime) {
        setClockInTime('');
        setClockOutTime('');
        setAttendanceDate(moment().format('YYYY-MM-DD')); // Reset date to current for next day
      }
      getUserLocationAndFetchStatus(); // Refresh status
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setMessage(error.response?.data?.message || 'Failed to submit attendance.');
    }
  };

  const isMapReady = !loading && (userLocation || geofences.length > 0);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Employee Attendance Board</h2>
      
      {employeeProfile?.branch?.branchName && (
        <p className="alert alert-success">Branch: {employeeProfile.branch.branchName}</p>
      )}
      {message && (
        <p className="alert alert-warning">{message}</p>
      )}
      {geoFenceMessage && (
        <p className="alert alert-info">{geoFenceMessage}</p>
      )}
      
      {loading && <p>Loading attendance data...</p>}

      {!loading && hasEmployeeProfile && (
        <>
          {attendanceStatus && attendanceStatus.status && attendanceStatus.status !== 'not-checked-in' ? (
            <div>
              <h3>Current Status: {attendanceStatus.status || 'N/A'}</h3>
              <p>{attendanceStatus.message || 'N/A'}</p>
            </div>
          ) : (
            <div>
              <h3>Current Status: Not Clocked In</h3>
              <p>Please submit your attendance for today.</p>
            </div>
          )}

          <form onSubmit={handleSubmitAttendance} style={{ marginBottom: '20px' }}>
            <div className="mb-3">
              <label htmlFor="attendanceDate" className="form-label">Date:</label>
              <input
                type="date"
                className="form-control"
                id="attendanceDate"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                required
                disabled={isClockedIn} // Disable date field if already clocked in
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clockInTime" className="form-label">Clock-In Time:</label>
              <input
                type="time"
                className="form-control"
                id="clockInTime"
                value={clockInTime}
                onChange={(e) => setClockInTime(e.target.value)}
                required
                disabled={isClockedIn} // Disable clock-in time if already clocked in
              />
            </div>
            <div className="mb-3">
              <label htmlFor="clockOutTime" className="form-label">Clock-Out Time (Optional):</label>
              <input
                type="time"
                className="form-control"
                id="clockOutTime"
                value={clockOutTime}
                onChange={(e) => setClockOutTime(e.target.value)}
                disabled={!isClockedIn} // Disable clock-out time if not clocked in yet
              />
            </div>
            <button 
              type="button" 
              onClick={handleClockInClick}
              className="btn btn-info me-2"
              disabled={isClockedIn}
            >
              Auto Clock-In
            </button>
            <button 
              type="button" 
              onClick={handleClockOutClick}
              className="btn btn-warning me-2"
              disabled={!isClockedIn || clockOutTime !== ''} // Disable if not clocked in or already clocked out
            >
              Auto Clock-Out
            </button>
            <button type="submit" className="btn btn-primary me-2">
              Submit Attendance
            </button>
            <button type="button" onClick={getUserLocationAndFetchStatus} className="btn btn-secondary">
              Refresh Status & Location
            </button>
          </form>
        </>
      )}

      {isMapReady && hasEmployeeProfile ? (
        <div style={{ marginTop: '20px', height: '400px', width: '100%' }}>
          <h3>Your Location & Geofences</h3>
          <MapContainer 
            center={[20.5937, 78.9629]}
            zoom={5} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            whenCreated={setMap}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {userLocation && (
              <Marker position={[userLocation.latitude, userLocation.longitude]}>
                <Popup>Your current location</Popup>
              </Marker>
            )}
            
            {geofences.map((fence) => {
              const lat = parseFloat(fence.latitude);
              const lng = parseFloat(fence.longitude);

              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <React.Fragment key={fence.id || fence.geoFenceId}>
                  <Marker 
                    position={[lat, lng]} 
                    icon={redIcon}
                  >
                    <Popup>
                      <b>{fence.geoFenceName}</b><br />Radius: {fence.radiusMeters}m
                    </Popup>
                  </Marker>
                  <Circle
                    center={[lat, lng]}
                    radius={Number(fence.radiusMeters) || 1}
                    pathOptions={{
                      color: 'red',
                      weight: 2,
                      fillColor: '#f03',
                      fillOpacity: 0.1,
                    }}
                  >
                    <Popup>
                      <b>{fence.geoFenceName}</b><br />Radius: {fence.radiusMeters}m
                    </Popup>
                  </Circle>
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      ) : (
        !loading && !hasEmployeeProfile && <div style={{ marginTop: '20px' }}><p>Cannot display map: Employee profile or branch information is missing.</p></div>
      )}
    </div>
  );
};

export default AttendanceBoard;