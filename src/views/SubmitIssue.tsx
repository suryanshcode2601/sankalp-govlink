

import React, { useState, useEffect } from 'react';
import {
  Shield,
  ChevronLeft,
  Upload,
  MapPin,
  Send,
  CheckCircle2,
  Sparkles,
  Search,
  Crosshair,
  Loader2,
  Settings
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useApp } from '../AppContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix broken marker icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Moves map view when coords change (e.g. after GPS fetch)
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 16); }, [center, map]);
  return null;
}

// Handles map click to move marker
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SubmitIssue() {
  const navigate = useNavigate();
  const { refreshIssues } = useApp();
  const [files, setFiles] = useState<File[]>([]);

  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Add these states near your other useState declarations
  const [aiLabel, setAiLabel] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Location state
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('Fetching your location…');
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Add this effect — fires 800ms after user stops typing
  useEffect(() => {
    if (!description || description.length < 10) {
      setAiLabel(null);
      setAiConfidence(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setAiLoading(true);
      try {
        const res = await fetch('http://127.0.0.1:8000/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description }),
        });
        const data = await res.json();
        setAiLabel(data.type);
        setAiConfidence(data.confidence);
      } catch {
        // silently fail
      } finally {
        setAiLoading(false);
      }
    }, 800); // debounce — waits for user to stop typing

    return () => clearTimeout(timeout);
  }, [description]);
  // ── Auto-fetch GPS on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser.');
      setLocationLoading(false);
      setCoords({ lat: 20.5937, lng: 78.9629 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        await reverseGeocode(lat, lng);
        setLocationLoading(false);
      },
      () => {
        setLocationError('Location access denied. Search or click the map to set location.');
        setLocationLoading(false);
        setCoords({ lat: 20.5937, lng: 78.9629 });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // ── Reverse geocode → area name ─────────────────────────────────────────────
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const name =
        data.address?.suburb ||
        data.address?.neighbourhood ||
        data.address?.town ||
        data.address?.city ||
        data.display_name?.split(',')[0] ||
        'Your Location';
      setLocationName(name);
    } catch {
      setLocationName('Your Location');
    }
  };

  // ── Address search ──────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setCoords({ lat, lng });
        setLocationName(data[0].display_name.split(',')[0]);
      } else {
        alert('Address not found. Try a different search.');
      }
    } catch {
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // ── Map click → reposition marker ──────────────────────────────────────────
  const handleMapClick = async (lat: number, lng: number) => {
    setCoords({ lat, lng });
    await reverseGeocode(lat, lng);
  };

  // ── Recenter to GPS ─────────────────────────────────────────────────────────
  const handleRecenter = () => {
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        await reverseGeocode(lat, lng);
        setLocationLoading(false);
      },
      () => {
        setLocationError('Could not get your location.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  // const handleSubmit = async () => {
  //   if (!description || !coords) return;
  //   setIsSubmitting(true);
  //   try {
  //     const response = await fetch('http://127.0.0.1:8000/api/issues', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         description,
  //         location_name: locationName,
  //         lat: coords.lat,
  //         lng: coords.lng,
  //       }),
  //     });
  //     if (!response.ok) throw new Error('API request failed');
  //     await refreshIssues();
  //     setSubmitted(true);
  //     setTimeout(() => navigate('/'), 1500);
  //   } catch (err) {
  //     console.error('SUBMIT ERROR:', err);
  //     alert('Failed to submit. Please try again.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

 const handleSubmit = async () => {
  if (!description || !coords) return;
  setIsSubmitting(true);
  try {
    // 1. Upload images first
    let imagePaths = "";
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach(f => formData.append("files", f));
      const uploadRes = await fetch("https://sankalp-govlink-production.up.railway.app/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      imagePaths = uploadData.paths.join(",");
    }

    // 2. Submit the issue with paths
    const response = await fetch("https://sankalp-govlink-production.up.railway.app/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        location_name: locationName,
        lat: coords.lat,      // ← was just `lat` before (undefined)
        lng: coords.lng,      // ← was just `lng` before (undefined)
        image_paths: imagePaths,
      }),
    });

    if (!response.ok) throw new Error('API request failed');
    await refreshIssues();
    setSubmitted(true);
    setTimeout(() => navigate('/'), 1500);
  } catch (err) {
    console.error('SUBMIT ERROR:', err);
    alert('Failed to submit. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0c12] text-slate-200 flex flex-col">

      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">GovConnect</h1>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest">My Issues</a>
          <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest">Notifications</a>
          <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
            <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Link to="/" className="hover:text-slate-300">Home</Link>
              <ChevronLeft size={12} className="rotate-180" />
              <span>Issue Submission</span>
            </div>
            <h2 className="text-5xl font-bold tracking-tight">Submit a New Issue</h2>
            <p className="text-slate-500 text-lg">
              Help us improve your neighborhood by reporting local concerns. Most issues are reviewed within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* ── Left column ── */}
            <div className="col-span-8 space-y-6">

              {/* Step 1 — Description */}
              <div className="glass-card p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">1</div>
                  <h3 className="text-2xl font-bold">Issue Description</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-300">What is the issue?</p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300 focus:outline-none focus:border-blue-500 min-h-[160px] transition-colors"
                    placeholder="Please provide details about the problem (e.g., Pothole on 5th Ave, broken street light, etc.)"
                  />
                </div>
              </div>

              {/* Step 2 — Evidence Upload
              <div className="glass-card p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">2</div>
                  <h3 className="text-2xl font-bold">Evidence Upload</h3>
                </div>
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 transition-colors cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                    <Upload className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">Drag and drop photos or videos</p>
                    <p className="text-slate-500 text-sm">PNG, JPG, or MP4 up to 50MB</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
                    Select Files
                  </button>
                </div>
              </div> */}

              {/* Step 2 — Evidence Upload */}
<div className="glass-card p-8 space-y-6">
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">2</div>
    <h3 className="text-2xl font-bold">Evidence Upload</h3>
  </div>

  <div
    className="border-2 border-dashed border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 transition-colors cursor-pointer group"
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files).filter(f =>
        f.type.startsWith("image/") || f.type === "video/mp4"
      );
      setFiles(prev => [...prev, ...dropped]);
    }}
  >
    <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
      <Upload className="text-slate-500 group-hover:text-blue-500 transition-colors" />
    </div>
    <div className="text-center">
      <p className="font-bold text-lg">Drag and drop photos or videos</p>
      <p className="text-slate-500 text-sm">PNG, JPG, or MP4 up to 50MB</p>
    </div>
    <label className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold transition-colors cursor-pointer">
      Select Files
      <input
        type="file"
        accept="image/png,image/jpeg,video/mp4"
        multiple
        className="hidden"
        onChange={(e) => {
          const picked = Array.from(e.target.files || []);
          setFiles(prev => [...prev, ...picked]);
        }}
      />
    </label>
  </div>

  {/* Preview grid */}
  {files.length > 0 && (
    <div className="grid grid-cols-3 gap-3 mt-4">
      {files.map((file, i) => (
        <div key={i} className="relative rounded-xl overflow-hidden aspect-square bg-slate-900">
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
            className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
</div>

              {/* Step 3 — Location Tagging ✅ UPDATED */}
              <div className="glass-card p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">3</div>
                  <h3 className="text-2xl font-bold">Location Tagging</h3>
                </div>

                {/* Search */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search for address or area…"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-4 text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-5 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : 'Go'}
                  </button>
                </div>

                {/* Status */}
                <p className="text-sm flex items-center gap-2">
                  {locationLoading ? (
                    <><Loader2 size={14} className="animate-spin text-slate-400" /><span className="text-slate-400">Detecting your location…</span></>
                  ) : locationError ? (
                    <><MapPin size={14} className="text-amber-400" /><span className="text-amber-400">{locationError}</span></>
                  ) : (
                    <><MapPin size={14} className="text-blue-400" /><span className="text-blue-300">{locationName}</span><span className="text-slate-500 ml-1">— or click the map to adjust</span></>
                  )}
                </p>

                {/* Leaflet Map */}
                <div className="aspect-video rounded-2xl border border-slate-800 relative overflow-hidden">
                  {coords && (
                    <MapContainer
                      center={[coords.lat, coords.lng]}
                      zoom={16}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <RecenterMap center={[coords.lat, coords.lng]} />
                      <ClickHandler onMapClick={handleMapClick} />
                      <Marker position={[coords.lat, coords.lng]} />
                    </MapContainer>
                  )}

                  {/* Loading overlay */}
                  {locationLoading && (
                    <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center gap-3 z-[1000]">
                      <Loader2 className="animate-spin text-blue-400" size={32} />
                      <p className="text-slate-400 text-sm">Getting your location…</p>
                    </div>
                  )}

                  {/* Recenter button */}
                  <button
                    onClick={handleRecenter}
                    title="Use my GPS location"
                    className="absolute bottom-4 right-4 z-[1000] p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors shadow-lg"
                  >
                    <Crosshair size={18} className="text-slate-300" />
                  </button>
                </div>

                {/* Coords */}
                {coords && !locationLoading && (
                  <p className="text-xs text-slate-600 font-mono">
                    {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            {/* ── Right column: Sidebar ── */}
            <div className="col-span-4 space-y-6">
              <div className="glass-card p-8 space-y-8">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Sparkles size={20} />
                  AI Classification
                </div>
                <p className="text-sm text-slate-400">Our AI suggests this issue belongs to:</p>

                {/* <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <Settings className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest">Infrastructure</p>
                    <p className="text-[10px] text-blue-400 font-bold">98% Confidence Score</p>
                  </div>
                </div> */}

                
<div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-6 flex items-center gap-4">
  <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
    {aiLoading
      ? <Loader2 className="text-blue-500 animate-spin" />
      : <Settings className="text-blue-500" />
    }
  </div>
  <div>
    {aiLabel ? (
      <>
        <p className="text-sm font-black uppercase tracking-widest">{aiLabel}</p>
        {aiConfidence && (
          <p className="text-[10px] text-blue-400 font-bold">
            {Math.round(aiConfidence * 100)}% Confidence Score
          </p>
        )}
      </>
    ) : (
      <p className="text-sm text-slate-500 italic">
        {description.length < 10
          ? 'Start typing to classify…'
          : 'Classifying…'}
      </p>
    )}
  </div>
</div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Department</span>
                    <span className="font-bold">Public Works</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Estimated Response</span>
                    <span className="font-bold">48 Hours</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="font-bold text-blue-500">Drafting</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !description || !coords}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-lg"
                >
                  {submitted ? (
                    <><CheckCircle2 size={20} /> Submitted!</>
                  ) : isSubmitting ? (
                    <><Loader2 size={20} className="animate-spin" /> Submitting…</>
                  ) : (
                    <>Submit Report <Send size={20} /></>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-500 font-medium leading-relaxed">
                  By submitting, you agree to our terms of service regarding public safety reporting.
                </p>
              </div>

              <div className="glass-card p-8 space-y-6">
                <h4 className="font-bold text-lg">Tips for a fast resolution</h4>
                <ul className="space-y-4">
                  <TipItem text="Include a photo of the surrounding area for context." />
                  <TipItem text="Describe the urgency (e.g., 'blocking traffic')." />
                  <TipItem text="Tag the exact GPS location if possible." />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-16 border-t border-slate-800 flex items-center justify-between px-12 text-xs text-slate-500 font-medium shrink-0">
        <div className="flex items-center gap-2">
          <Shield size={14} />
          © 2026 GovConnect Local Authority Portal
        </div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Help Center</a>
          <a href="#" className="hover:text-slate-300">Accessibility</a>
        </div>
      </footer>
    </div>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <li className="flex gap-3 items-start">
      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
        <CheckCircle2 size={12} className="text-white" />
      </div>
      <span className="text-sm text-slate-400 leading-relaxed">{text}</span>
    </li>
  );
}
