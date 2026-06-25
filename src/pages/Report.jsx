import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useStore } from '../store/useStore';
import { supabase, isSupabaseConfigured } from '../supabase/config';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Camera, AlertCircle, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Search } from 'lucide-react';
import L from 'leaflet';

// Redesigned SVG Pin Marker (using theme primary blue)
const activeLocationIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0066FF" width="32" height="32" style="
      filter: drop-shadow(0 2px 5px rgba(0,102,255,0.3));
    ">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `,
  className: 'report-location-marker-svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// Helper component to capture map clicks
function MapClickEvents({ onMapClick, position }) {
  const map = useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    }
  });

  useEffect(() => {
    if (position) {
      map.setView(position, 14, { animate: true });
    }
  }, [position, map]);

  return null;
}

export default function Report() {
  const { currentUser, addReport } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Location Step states
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [locationName, setLocationName] = useState("Indiranagar, Bangalore");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Media Step states
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Details & Severity states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Pothole");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("High");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // OpenStreetMap Nominatim Geocoding Search (Free & Unlimited Local Search)
  const handleSearchAddress = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const firstResult = data[0];
        const lat = parseFloat(firstResult.lat);
        const lon = parseFloat(firstResult.lon);
        setLatitude(lat);
        setLongitude(lon);
        setLocationName(firstResult.display_name);
      } else {
        setSearchError("No results found. Try adding city name or specific landmarks.");
      }
    } catch (error) {
      console.error("Geocoding search failed:", error);
      setSearchError("Location search failed. Please check your network connection.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Reverse-Geocoding on Map Click
  const handleMapClick = async (coords) => {
    setLatitude(coords[0]);
    setLongitude(coords[1]);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`);
      const data = await response.json();
      if (data && data.display_name) {
        setLocationName(data.display_name);
      } else {
        setLocationName(`GPS Coordinates: ${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`);
      }
    } catch {
      setLocationName(`GPS Coordinates: ${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`);
    }
  };

  // Detect current GPS location
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
              setLocationName(data.display_name);
            } else {
              setLocationName(`GPS Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            }
          } catch {
            setLocationName(`GPS Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  // Real Supabase Storage Image Upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isSupabaseConfigured) {
      setUploadError("Storage is not configured yet. Set active credentials to enable evidence uploads.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setImageUrl("");

    try {
      try {
        await supabase.storage.createBucket('issue-evidences', { public: true });
      } catch (err) {
        console.warn("Storage auto-creation skipped:", err.message);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from('issue-evidences')
        .upload(filePath, file);

      if (error) throw new Error(error.message);

      const { data: { publicUrl } } = supabase.storage
        .from('issue-evidences')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (error) {
      console.error("Supabase Storage error:", error);
      let errorMsg = error.message;
      if (errorMsg.toLowerCase().includes("bucket not found") || errorMsg.toLowerCase().includes("does not exist")) {
        errorMsg = "Bucket 'issue-evidences' not found. Please create a public bucket named 'issue-evidences' in storage console.";
      }
      setUploadError(`Storage Upload Failed: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Run AI Impact Assessment simulation
  const runAiAnalysis = () => {
    setIsAiLoading(true);
    setStep(5);

    setTimeout(() => {
      let predictedCategory = category;
      let predictedUrgency = "Medium Priority Response (7 Days)";
      let predictedImpact = "";
      let predictedActions = "";

      const descLower = (description || "").toLowerCase();

      // Urgency assessment based on severity
      if (severity === 'Critical') {
        predictedUrgency = "Immediate Emergency Dispatch Triggered";
      } else if (severity === 'High') {
        predictedUrgency = "High Priority Municipal Task (48 Hours)";
      } else if (severity === 'Low') {
        predictedUrgency = "Low Priority Routine Maintenance";
      }

      // Generate dynamic impact and actions based on Category
      switch (category) {
        case 'Pothole':
          predictedImpact = `Hazardous road surface damage. ${
            severity === 'Critical' 
              ? 'Presenting immediate risk of tire blowouts, suspension damage, and vehicle collisions at speed.' 
              : 'Disrupts smooth traffic flow and presents moderate risks to cyclists.'
          }`;
          predictedActions = severity === 'Critical'
            ? 'Deploy emergency asphalt cold-mix crew, set warning signage, and schedule road resurfacing.'
            : 'Log in asphalt repair list for weekly maintenance run.';
          break;
        case 'Garbage':
          predictedImpact = `Accumulated refuse causing public hygiene risks. ${
            descLower.includes('smell') || descLower.includes('odor') 
              ? 'Significant foul odor and attraction of pests/rodents noted.' 
              : 'Blockage of pedestrian walkways and aesthetic degradation.'
          }`;
          predictedActions = 'Dispatch waste disposal truck, clean public area, and check for illegal dump sources.';
          break;
        case 'Water Leakage':
          predictedImpact = `Uncontrolled water main discharge. ${
            severity === 'Critical'
              ? 'Presents significant localized street flooding, water wastage, and potential road foundation erosion.'
              : 'Constant stream causing slippery surfaces and mold accumulation.'
          }`;
          predictedActions = 'Alert municipal water board, locate primary isolation valve, shut off supply, and dispatch pipe welding crew.';
          break;
        case 'Broken Streetlight':
          predictedImpact = 'Complete lack of street lighting in the zone, significantly reducing nighttime visibility and raising pedestrian safety/crime risks.';
          predictedActions = 'Schedule public works electrician to replace bulb/fixture and test local transformer wiring.';
          break;
        case 'Drainage':
          predictedImpact = `Sewer or storm-water drainage blockages. ${
            severity === 'Critical'
              ? 'Severe drainage blockage leading to toxic overflow, backflow issues in nearby homes, and road inundation.'
              : 'Stagnant water accumulation posing mosquito breeding risk.'
          }`;
          predictedActions = 'Dispatch suction pump truck, clear grit/garbage obstruction from culvert, inspect sewer mains.';
          break;
        case 'Illegal Dumping':
          predictedImpact = 'Unauthorized disposal of bulk waste or hazardous materials. Poses environmental safety hazards and attracts further dumping behavior.';
          predictedActions = 'Clean site, install deterrent signage/CCTV warning, coordinate local neighborhood watch.';
          break;
        case 'Safety Hazard':
          predictedImpact = `Significant safety hazard: "${description || 'Public hazard'}". Poses physical injury or safety risks to residents.`;
          predictedActions = 'Cordon off site immediately, dispatch inspector to evaluate structural integrity, coordinate with local safety teams.';
          break;
        default:
          predictedImpact = `Public hazard report for category: ${category}. Poses minor to moderate community safety and infrastructure efficiency risks.`;
          predictedActions = 'Log issue in civic tracker, schedule routine public works inspection.';
      }

      // Add descriptive keyword-based spice
      if (descLower.includes('accident') || descLower.includes('hurt') || descLower.includes('crash')) {
        predictedImpact += " High urgency due to resident safety complaints and accidents reported.";
        if (severity !== 'Critical') {
          predictedUrgency = "Elevated Priority (Risk of Injury)";
        }
      }

      setAiAnalysis({
        category: predictedCategory,
        urgency: predictedUrgency,
        impact: predictedImpact,
        suggestedActions: predictedActions
      });
      setIsAiLoading(false);
    }, 2500);
  };

  const handleSubmit = () => {
    addReport({
      title: title.trim(),
      category,
      description: description.trim(),
      severity,
      location: locationName,
      latitude,
      longitude,
      images: imageUrl ? [imageUrl] : [],
      aiAnalysis
    });
    setStep(6);
  };

  const handleNextStep = () => {
    if (step === 4) {
      runAiAnalysis();
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 font-inter text-brand-text">
      
      {/* Step Progress Tracker */}
      {step < 6 && (
        <div className="mb-8 flex items-center justify-between text-xs font-semibold text-brand-textSecondary border-b border-slate-100 pb-4">
          <span>Reporting Wizard</span>
          <div className="flex gap-1.5 font-poppins">
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                className={`w-5.5 h-5.5 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all ${
                  step === num
                    ? 'bg-primary-blue text-white border-primary-blue shadow-glow-primary'
                    : step > num
                    ? 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Wizard Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: LOCATION & SEARCH */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-xl font-extrabold text-brand-text font-poppins">Step 1: Set Hazard Location</h2>
                <p className="text-xs text-brand-textSecondary mt-1">
                  Type a landmark address or click directly on the map to set the exact coordinates of the issue.
                </p>
              </div>

              {/* Geocoding Search Form */}
              <form onSubmit={handleSearchAddress} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search landmark or address (e.g. Indiranagar, Bangalore)..."
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-250 focus:outline-none focus:border-primary-soft focus:bg-white transition-all font-medium text-brand-text rounded-btn"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-brand-text rounded-btn text-xs font-bold px-4 py-2 flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  {searchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
                </button>
              </form>

              {searchError && (
                <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {searchError}
                </p>
              )}

              {/* Map Container */}
              <div className="w-full h-72 rounded-card overflow-hidden border border-slate-200 shadow-sm relative bg-slate-50">
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={14}
                  attributionControl={false}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <MapClickEvents onMapClick={handleMapClick} position={[latitude, longitude]} />
                  <Marker position={[latitude, longitude]} icon={activeLocationIcon} />
                </MapContainer>

                <button
                  type="button"
                  onClick={detectLocation}
                  className="absolute bottom-3 right-3 z-[1000] bg-white hover:bg-slate-50 border border-slate-250 rounded-btn px-3 py-1.5 text-[9px] font-bold shadow-md text-primary-blue flex items-center gap-1 cursor-pointer transition-all"
                >
                  <MapPin className="w-3 h-3" />
                  Auto-Detect GPS
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">
                  Location / Landmark Name
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Near 24 Valencia St, main intersection"
                  required
                  className="w-full text-xs border border-slate-250 focus:border-primary-soft focus:outline-none bg-slate-50 rounded-btn p-3 transition-all font-medium text-brand-text focus:ring-1 focus:ring-primary-soft/30 focus:bg-white"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2: REAL FILE UPLOAD */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-extrabold text-brand-text font-poppins">Step 2: Upload Evidence</h2>
                <p className="text-xs text-brand-textSecondary mt-1 font-semibold">
                  Upload a photo of the reported issue.
                </p>
              </div>

              {/* Real File Input drop box */}
              <div className="relative border border-dashed border-slate-350 hover:border-primary-soft rounded-card bg-slate-50/50 p-10 text-center cursor-pointer transition-colors duration-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {isUploading ? (
                  <div className="space-y-2">
                    <Loader2 className="w-10 h-10 text-primary-blue animate-spin mx-auto" />
                    <span className="text-xs font-bold text-slate-500 block">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <span className="text-xs font-bold text-slate-700 block">Click here to select a photo</span>
                    <span className="text-[9px] text-slate-400 block mt-1 font-bold uppercase tracking-wider">PNG, JPG up to 5MB</span>
                  </>
                )}
              </div>

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs font-semibold text-red-700 leading-relaxed flex gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-red-600 flex-shrink-0" />
                  <p>{uploadError}</p>
                </div>
              )}

              {/* Show preview if uploaded */}
              {imageUrl && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Uploaded Image Preview</label>
                  <div className="relative w-full h-56 rounded-card overflow-hidden border border-slate-200 shadow-sm">
                    <img src={imageUrl} alt="Upload Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2.5 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1 animate-pulse">
                      <CheckCircle2 className="w-3 h-3 fill-white text-green-600" />
                      <span>Ready</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-xl font-extrabold text-brand-text font-poppins">Step 3: Issue Details</h2>
                <p className="text-xs text-brand-textSecondary mt-1">
                  Describe what the problem is and how it affects local residents.
                </p>
              </div>

              <div className="space-y-4 font-semibold text-xs text-brand-text">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1.5">
                    Issue Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Deep pothole on 100 Feet Road"
                    required
                    className="w-full border border-slate-250 rounded-btn p-3 focus:outline-none focus:border-primary-soft bg-slate-50 focus:bg-white transition-all focus:ring-1 focus:ring-primary-soft/30 text-brand-text font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-btn p-3 focus:outline-none focus:border-primary-soft focus:bg-white transition-all text-brand-text font-medium"
                    >
                      <option value="Pothole">Pothole</option>
                      <option value="Garbage">Garbage Overflow</option>
                      <option value="Water Leakage">Water Leakage</option>
                      <option value="Broken Streetlight">Broken Streetlight</option>
                      <option value="Drainage">Drainage Issue</option>
                      <option value="Illegal Dumping">Illegal Dumping</option>
                      <option value="Safety Hazard">Safety Hazard</option>
                      <option value="Traffic Issue">Traffic Congestion</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide enough details like when this started, estimated size, how it blocks cars/people..."
                    required
                    className="w-full border border-slate-250 rounded-btn p-3 focus:outline-none focus:border-primary-soft bg-slate-50 focus:bg-white transition-all focus:ring-1 focus:ring-primary-soft/30 text-brand-text font-medium leading-relaxed"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SEVERITY */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-extrabold text-brand-text font-poppins">Step 4: Grade Severity</h2>
                <p className="text-xs text-brand-textSecondary mt-1 font-semibold">
                  How urgent is this issue? Select the best matching priority tier.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'Low', color: 'border-green-200 text-green-700 bg-green-50/50', desc: 'No direct crash risk. Cosmetic or minor inconvenience (e.g. small graffiti, minor litter).' },
                  { id: 'Medium', color: 'border-yellow-200 text-yellow-700 bg-yellow-50/50', desc: 'Blocks pathways slightly, or wastes resource (e.g. water pipeline leaks, street cleaning).' },
                  { id: 'High', color: 'border-orange-200 text-orange-700 bg-orange-50/50', desc: 'Presents accident/safety risk. Major sidewalk blockages, broken school streetlights.' },
                  { id: 'Critical', color: 'border-red-200 text-red-700 bg-red-50/50 shadow-glow-danger', desc: 'Direct life hazard or massive transit congestion (e.g. deep pothole on high speed lanes, open manholes).' }
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSeverity(tier.id)}
                    className={`flex items-start gap-3 border p-4 rounded-card text-left font-inter transition-all cursor-pointer ${
                      severity === tier.id 
                        ? `${tier.color} border-slate-450 ring-2 ring-slate-400/10` 
                        : 'border-slate-150 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full mt-1 flex-shrink-0 ${tier.id === 'Low' ? 'bg-primary-green shadow-glow-success' : tier.id === 'Medium' ? 'bg-yellow-500' : tier.id === 'High' ? 'bg-orange-550 shadow-glow-warning' : 'bg-red-500 shadow-glow-danger'}`} />
                    <div>
                      <span className="font-bold text-sm block text-slate-800">{tier.id}</span>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-normal">{tier.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 5: AI RUNNING & ASSESSMENT */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10"
            >
              {isAiLoading ? (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-primary-blue animate-spin mx-auto" />
                  <h3 className="font-poppins font-bold text-base text-brand-text">Gemini AI is analyzing hazard...</h3>
                  <p className="text-xs text-brand-textSecondary max-w-xs leading-relaxed font-semibold">
                    Auto-categorizing issue details, analyzing potential community impact risk, and checking for duplicate reports in your ward area.
                  </p>
                </div>
              ) : (
                <div className="w-full space-y-6">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-primary-blue/5 border border-primary-blue/15 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-glow-primary">
                      <Sparkles className="w-5.5 h-5.5 text-primary-blue animate-pulse-slow" />
                    </div>
                    <h2 className="text-xl font-extrabold text-brand-text font-poppins">Gemini AI Analysis Assessment</h2>
                    <p className="text-xs text-brand-textSecondary mt-1 font-semibold">
                      Our AI models processed your description and validated the classification.
                    </p>
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-card p-5 space-y-4 text-xs font-semibold leading-relaxed">
                    <div>
                      <span className="text-[10px] text-indigo-600 block uppercase font-bold tracking-widest mb-0.5">Identified Category</span>
                      <span className="text-sm font-extrabold text-slate-800 font-poppins">{aiAnalysis?.category}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-indigo-600 block uppercase font-bold tracking-widest mb-0.5">Urgency Assessment</span>
                      <span className="text-slate-700 block font-bold">{aiAnalysis?.urgency}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-indigo-600 block uppercase font-bold tracking-widest mb-0.5">Social/Hazard Impact</span>
                      <p className="text-slate-600 font-semibold">{aiAnalysis?.impact}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-indigo-600 block uppercase font-bold tracking-widest mb-0.5">Immediate Corrective Actions</span>
                      <p className="text-slate-600 font-semibold">{aiAnalysis?.suggestedActions}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 6: SUBMIT CONFIRMATION SUCCESS */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-6"
            >
              <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto shadow-glow-success animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-primary-green fill-green-50" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-brand-text font-poppins">Ticket Filed Successfully!</h2>
                <p className="text-xs text-brand-textSecondary mt-2 max-w-sm mx-auto leading-relaxed font-semibold">
                  Your report has been cataloged in the community database. Neighbor nodes can now verify and praise the issue to draw authority attention.
                </p>
              </div>

              {/* Point rewards showcase */}
              <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl py-4 max-w-xs mx-auto text-center shadow-sm">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-700 block mb-1">Reputation Reward</span>
                <span className="font-poppins font-black text-3xl text-amber-600 leading-none block">+20 Points</span>
                <span className="text-[9px] text-slate-500 font-bold block mt-1 uppercase tracking-wider font-bold">Earned "Civic Reporter" score</span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="gradient-btn px-8 py-3 rounded-btn text-xs font-bold shadow-premium cursor-pointer"
              >
                Browse Explore Feed
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {step < 5 && (
        <div className="flex justify-between items-center pt-8 border-t border-slate-100/60 text-xs font-bold mt-8">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={step === 1}
            className={`flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-btn text-brand-text hover:bg-slate-50 bg-white transition-all cursor-pointer ${
              step === 1 ? 'opacity-30 pointer-events-none' : ''
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            type="button"
            onClick={handleNextStep}
            disabled={(!title && step === 3) || (!imageUrl && step === 2 && !isUploading)}
            className={`gradient-btn flex items-center gap-1.5 px-5 py-2.5 rounded-btn active:scale-98 cursor-pointer ${
              ((!title && step === 3) || (!imageUrl && step === 2)) ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {step === 4 ? 'Run AI Diagnostics' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 5 && !isAiLoading && (
        <div className="flex justify-between items-center pt-8 border-t border-slate-100/60 text-xs font-bold mt-8">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-btn text-brand-text hover:bg-slate-50 bg-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Edit Info
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            className="gradient-btn flex items-center gap-1.5 px-6 py-2.5 rounded-btn active:scale-98 cursor-pointer"
          >
            <span>Submit Community Ticket</span>
            <CheckCircle2 className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

    </div>
  );
}
