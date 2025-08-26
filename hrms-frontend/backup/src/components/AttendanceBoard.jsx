import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

  useEffect(() => {
    getUserLocationAndFetchStatus();
  }, []);

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
      } else {
        setMessage("Your employee profile is not assigned to a branch. Please contact an administrator.");
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setMessage(error.response?.data?.message || 'Failed to load initial attendance data.');
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

  const handleClockIn = async () => {
    if (!userLocation) {
      setMessage("Please enable location services and refresh to clock in.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/attendance/clock-in`,
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          location: `Lat: ${userLocation.latitude}, Lon: ${userLocation.longitude}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setAttendanceStatus(response.data.data);
    } catch (error) {
      console.error('Error clocking in:', error);
      setMessage(error.response?.data?.message || 'Failed to clock in.');
    }
  };

  const handleClockOut = async () => {
    if (!userLocation) {
      setMessage("Please enable location services and refresh to clock out.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/attendance/clock-out`,
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          location: `Lat: ${userLocation.latitude}, Lon: ${userLocation.longitude}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setAttendanceStatus(response.data.data);
    } catch (error) {
      console.error('Error clocking out:', error);
      setMessage(error.response?.data?.message || 'Failed to clock out.');
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

      {!loading && (
        <>
          {attendanceStatus && (
            <div>
              <h3>Current Status: {attendanceStatus.status || 'Not Clocked In'}</h3>
              <p>{attendanceStatus.message || 'Press "Clock In" to start your day.'}</p>
            </div>
          )}

          <div>
            <button 
              onClick={handleClockIn}
              disabled={!attendanceStatus?.clockIn || attendanceStatus?.clockOut || !userLocation}
              className="btn btn-success me-2"
            >
              Clock In
            </button>
            <button 
              onClick={handleClockOut}
              disabled={!attendanceStatus?.clockIn || attendanceStatus?.clockOut || !userLocation}
              className="btn btn-danger"
            >
              Clock Out
            </button>
            <button onClick={getUserLocationAndFetchStatus} className="btn btn-secondary ms-2">
              Refresh Status & Location
            </button>
          </div>
        </>
      )}

      {isMapReady ? (
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
        !loading && <div style={{ marginTop: '20px' }}><p>Map data is unavailable. Please ensure location services are enabled and you are assigned to a branch.</p></div>
      )}
    </div>
  );
};

export default AttendanceBoard;