import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../store/useStore';
import { loadGoogleMaps } from '../utils/loadGoogleMaps';
import { Filter, Eye, MapPin } from 'lucide-react';

// Custom Leaflet Marker Generator
const createCustomMarker = (severity, status) => {
  let color = '#0066FF'; // Primary Blue
  if (status === 'Resolved') {
    color = '#10B981'; // Success Green
  } else if (severity === 'Critical') {
    color = '#EF4444'; // Danger Red
  } else if (severity === 'High') {
    color = '#F59E0B'; // Warning Gold
  } else if (severity === 'Medium') {
    color = '#F59E0B'; // Yellow
  }

  return L.divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="30" height="30" style="
        filter: drop-shadow(0 2px 5px rgba(0,0,0,0.25));
      ">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `,
    className: 'custom-map-marker-svg',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Sub-component to dynamically pan/zoom Leaflet map on coordinate changes
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15, { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
}

export default function Maps() {
  const { reports } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default Bangalore, India
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Google Maps setup
  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const useGoogleMaps = !!(googleMapsKey && googleMapsKey !== 'your_google_maps_key_here');

  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const googleMapRef = useRef(null);
  const googleMapInstanceRef = useRef(null);
  const googleMarkersRef = useRef([]);
  const googleInfoWindowRef = useRef(null);
  const activeRootRef = useRef(null);

  // Load Google Maps script if configured
  useEffect(() => {
    if (useGoogleMaps) {
      loadGoogleMaps()
        .then(() => {
          setGoogleMapsLoaded(true);
        })
        .catch((err) => {
          console.error("Failed to load Google Maps API:", err);
        });
    }

    return () => {
      // Clean up InfoWindow React roots if any
      if (activeRootRef.current) {
        try {
          activeRootRef.current.unmount();
        } catch {
          // ignore
        }
        activeRootRef.current = null;
      }
    };
  }, [useGoogleMaps]);

  // Initialize Google Map
  useEffect(() => {
    if (!useGoogleMaps || !googleMapsLoaded || !googleMapRef.current) return;

    if (!googleMapInstanceRef.current) {
      googleMapInstanceRef.current = new window.google.maps.Map(googleMapRef.current, {
        center: { lat: mapCenter[0], lng: mapCenter[1] },
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            featureType: "administrative",
            elementType: "labels.text.fill",
            stylers: [{ color: "#444444" }]
          },
          {
            featureType: "landscape",
            elementType: "all",
            stylers: [{ color: "#f8fafc" }]
          },
          {
            featureType: "poi",
            elementType: "all",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "road",
            elementType: "all",
            stylers: [{ saturation: -100 }, { lightness: 45 }]
          },
          {
            featureType: "road.highway",
            elementType: "all",
            stylers: [{ visibility: "simplified" }]
          },
          {
            featureType: "road.arterial",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "transit",
            elementType: "all",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "water",
            elementType: "all",
            stylers: [{ color: "#cbd5e1" }, { visibility: "on" }]
          }
        ]
      });

      googleInfoWindowRef.current = new window.google.maps.InfoWindow();
    }
  }, [useGoogleMaps, googleMapsLoaded, mapCenter]);

  // Read coordinates from URL parameters if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lat = parseFloat(params.get('lat'));
    const lng = parseFloat(params.get('lng'));
    const id = params.get('id');

    if (!isNaN(lat) && !isNaN(lng)) {
      setMapCenter([lat, lng]);
      if (id) {
        setActiveMarkerId(id);
      }
    } else if (reports.length > 0) {
      // Default center to the first active/critical report if no URL parameters
      const firstActive = reports.find(r => r.status !== 'Resolved') || reports[0];
      setMapCenter([firstActive.latitude, firstActive.longitude]);
    }
  }, [location.search, reports]);

  // Pan to center when mapCenter updates (Google Maps only)
  useEffect(() => {
    if (useGoogleMaps && googleMapInstanceRef.current && googleMapsLoaded) {
      googleMapInstanceRef.current.panTo({ lat: mapCenter[0], lng: mapCenter[1] });
      googleMapInstanceRef.current.setZoom(15);
    }
  }, [mapCenter, useGoogleMaps, googleMapsLoaded]);

  // Filter reports
  const filteredReports = reports.filter((report) => {
    if (selectedCategory !== 'All' && report.category !== selectedCategory) return false;
    if (selectedSeverity !== 'All' && report.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'All' && report.status !== selectedStatus) return false;
    return true;
  });

  // Plot and update Google markers
  useEffect(() => {
    if (!useGoogleMaps || !googleMapInstanceRef.current || !googleMapsLoaded) return;

    // Clear existing markers
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];

    filteredReports.forEach((report) => {
      let color = '#0066FF'; // Primary Blue
      if (report.status === 'Resolved') {
        color = '#10B981'; // Success Green
      } else if (report.severity === 'Critical') {
        color = '#EF4444'; // Danger Red
      } else if (report.severity === 'High') {
        color = '#F59E0B'; // Warning Gold
      } else if (report.severity === 'Medium') {
        color = '#F59E0B'; // Yellow
      }

      const marker = new window.google.maps.Marker({
        position: { lat: report.latitude, lng: report.longitude },
        map: googleMapInstanceRef.current,
        title: report.title,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 1.5,
          scale: 1.25,
          anchor: new window.google.maps.Point(12, 22)
        }
      });

      marker.addListener('click', () => {
        // Unmount previous content if existing
        if (activeRootRef.current) {
          try {
            activeRootRef.current.unmount();
          } catch {
            // ignore
          }
          activeRootRef.current = null;
        }

        const container = document.createElement('div');
        container.style.width = '240px';
        container.style.padding = '4px';

        activeRootRef.current = createRoot(container);
        activeRootRef.current.render(
          <div className="font-inter text-slate-700 p-1">
            {report.images && report.images.length > 0 && (
              <img
                src={report.images[0]}
                alt={report.title}
                className="w-full h-28 object-cover rounded-lg mb-2 border border-slate-100"
              />
            )}
            
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="bg-primary-blue/5 text-primary-blue text-[9px] font-bold px-2 py-0.5 rounded-full border border-primary-blue/10">
                {report.category}
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                report.status === 'Resolved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {report.status}
              </span>
            </div>

            <h4 className="font-bold text-xs leading-snug mb-1 font-poppins text-slate-800">
              {report.title}
            </h4>
            
            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-2 font-semibold">
              {report.description}
            </p>

            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold mb-2.5">
              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{report.location}</span>
            </div>

            <button
              onClick={() => navigate(`/explore?issue=${report.id}`)}
              className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-btn bg-slate-900 hover:bg-primary-blue text-white text-[10px] font-bold shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Ticket Details</span>
            </button>
          </div>
        );

        googleInfoWindowRef.current.setContent(container);
        googleInfoWindowRef.current.open(googleMapInstanceRef.current, marker);

        googleInfoWindowRef.current.addListener('closeclick', () => {
          if (activeRootRef.current) {
            try {
              activeRootRef.current.unmount();
            } catch {
              // ignore
            }
            activeRootRef.current = null;
          }
        });
      });

      googleMarkersRef.current.push(marker);

      // If active marker matches URL param, click it
      if (activeMarkerId && report.id === activeMarkerId) {
        setTimeout(() => {
          window.google.maps.event.trigger(marker, 'click');
        }, 500);
      }
    });
  }, [filteredReports, useGoogleMaps, googleMapsLoaded, activeMarkerId, navigate]);

  const categories = ['All', 'Pothole', 'Garbage', 'Water Leakage', 'Broken Streetlight', 'Drainage', 'Illegal Dumping', 'Safety Hazard'];

  return (
    <div className="relative w-full h-[calc(100vh-64px)] flex overflow-hidden font-inter text-brand-text">
      {/* Toggle Button for mobile */}
      <button
        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        className="md:hidden absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-2 bg-brand-card border border-slate-200 rounded-btn text-xs font-bold text-brand-text shadow-md cursor-pointer hover:bg-slate-50"
      >
        <Filter className="w-4 h-4 text-primary-blue" />
        <span>{mobileFiltersOpen ? "Close Filters" : "Filters"}</span>
      </button>

      {/* Sidebar Filter Panel */}
      <div className={`absolute z-10 bg-brand-card/95 backdrop-blur-md rounded-card shadow-premium border border-slate-200/50 p-5 flex flex-col custom-scrollbar transition-all duration-200 ${
        mobileFiltersOpen 
          ? 'top-16 left-4 right-4 w-auto max-h-[70vh] flex overflow-y-auto' 
          : 'hidden md:flex top-4 left-4 w-72 max-h-[85vh] overflow-y-auto'
      }`}>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <Filter className="w-4 h-4 text-primary-blue" />
          <h2 className="font-poppins font-bold text-sm text-brand-text">Filter Map Pins</h2>
        </div>

        <div className="space-y-4 text-xs font-semibold text-brand-text">
          {/* Category filter */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1.5">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-btn p-2.5 focus:outline-none focus:border-primary-soft transition-all font-semibold"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Severity filter */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1.5">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-btn p-2.5 focus:outline-none focus:border-primary-soft transition-all font-semibold"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1.5">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-btn p-2.5 focus:outline-none focus:border-primary-soft transition-all font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-[10px] text-brand-textSecondary leading-normal">
          <p className="mb-2 font-bold uppercase tracking-wider text-[9px] text-slate-400">Legend:</p>
          <div className="space-y-1.5 font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-green shadow-glow-success" />
              <span>Resolved / Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-glow-danger" />
              <span>Critical Hazard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-glow-warning" />
              <span>High Severity Hazard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span>Medium Severity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-blue shadow-glow-primary" />
              <span>Active Low/Medium Hazard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Map Container */}
      <div className="w-full h-full relative">
        {useGoogleMaps ? (
          <>
            {!googleMapsLoaded && (
              <div className="absolute inset-0 bg-brand-bg flex items-center justify-center z-20">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">Loading Google Maps...</p>
                </div>
              </div>
            )}
            <div ref={googleMapRef} className="w-full h-full z-0" />
          </>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={13}
            attributionControl={false}
            style={{ width: '100%', height: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
            />
            <ChangeMapView center={mapCenter} />
            {filteredReports.map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={createCustomMarker(report.severity, report.status)}
              >
                <Popup maxWidth={260}>
                  <div className="font-inter text-slate-700 p-1">
                    {report.images && report.images.length > 0 && (
                      <img
                        src={report.images[0]}
                        alt={report.title}
                        className="w-full h-28 object-cover rounded-lg mb-2 border border-slate-100"
                      />
                    )}
                    
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="bg-primary-blue/5 text-primary-blue text-[9px] font-bold px-2 py-0.5 rounded-full border border-primary-blue/10">
                        {report.category}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        report.status === 'Resolved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs leading-snug mb-1 font-poppins text-slate-800">
                      {report.title}
                    </h4>
                    
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-2 font-semibold">
                      {report.description}
                    </p>

                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold mb-2.5">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{report.location}</span>
                    </div>

                    <button
                      onClick={() => navigate(`/explore?issue=${report.id}`)}
                      className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-btn bg-slate-900 hover:bg-primary-blue text-white text-[10px] font-bold shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Ticket Details</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
