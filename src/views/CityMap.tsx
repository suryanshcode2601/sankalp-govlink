import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../AppContext';
import Layout from '../components/Layout';
import { cn, Issue } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';
import { MapPin, AlertTriangle, CheckCircle2, Clock, Filter, X } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);

  return null;
}

export default function CityMap() {
  const { issues, userSettings } = useApp();
  const [searchParams] = useSearchParams();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filterType, setFilterType] = useState('All');
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    const issueId = searchParams.get('issueId');
    if (issueId) {
      const issue = issues.find(i => i.id === issueId);
      if (issue) {
        setSelectedIssue(issue);
        setMapCenter([issue.lat, issue.lng]);
        setMapZoom(15);
      }
    }
  }, [searchParams, issues]);

  const filteredIssues = issues.filter(issue => 
    filterType === 'All' || issue.type === filterType
  );

  const issueTypes = ['All', ...Array.from(new Set(issues.map(i => i.type)))];

  return (
    <Layout showTabs={false}>
      <div className="h-full flex relative">
        {/* Sidebar Filters */}
        <div className={cn("w-80 border-r p-6 space-y-6 shrink-0 z-10", userSettings.darkMode ? "bg-[#0a0c12] border-slate-800" : "bg-white border-slate-200")}>
          <div className="flex justify-between items-center">
            <h2 className={cn("font-bold text-xl", !userSettings.darkMode && "text-slate-900")}>City Map</h2>
            <Filter size={18} className="text-slate-500" />
          </div>

          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Filter by Type</p>
            <div className="flex flex-wrap gap-2">
              {issueTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                    filterType === type 
                      ? "bg-blue-600 text-white" 
                      : cn("text-slate-400 hover:text-slate-200", userSettings.darkMode ? "bg-slate-900" : "bg-slate-100 text-slate-500")
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Recent Reports</p>
            <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
              {filteredIssues.map(issue => (
                <div 
                  key={issue.id}
                  onClick={() => {
                    setSelectedIssue(issue);
                    setMapCenter([issue.lat, issue.lng]);
                    setMapZoom(15);
                  }}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all",
                    selectedIssue?.id === issue.id 
                      ? "border-blue-500 bg-blue-600/5" 
                      : cn("border-transparent hover:bg-slate-800/30", !userSettings.darkMode && "hover:bg-slate-50")
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "status-badge",
                      issue.status === 'PENDING' ? 'status-pending' : issue.status === 'DISPATCHED' ? 'status-dispatched' : 'status-resolved'
                    )}>
                      {issue.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">{issue.id}</span>
                  </div>
                  <h4 className={cn("text-sm font-bold truncate", !userSettings.darkMode && "text-slate-900")}>{(issue.description || "").split(".")[0]}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin size={10} /> {issue.location_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative z-0">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={userSettings.darkMode 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
            />
            <ChangeView center={mapCenter} zoom={mapZoom} />
            {filteredIssues
              .filter(issue => issue.lat && issue.lng)
              .map(issue => (
                <Marker
                    key={issue.id}
                    position={[issue.lat, issue.lng]}
                    eventHandlers={{
                        click: () => setSelectedIssue(issue),
                      }}
              >
              
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h4 className="font-bold text-slate-900">{issue.type}</h4>
                    <p className="text-xs text-slate-600 mt-1">{issue.description}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{issue.status}</span>
                      <span className="text-[10px] text-slate-400">{issue.id}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Issue Detail Modal (Overlay) */}
        {selectedIssue && (
          <div className="absolute top-8 right-8 w-96 z-[1000] animate-in slide-in-from-right duration-300">
            <div className={cn("glass-card p-6 shadow-2xl border-blue-500/30", userSettings.darkMode ? "bg-[#151921]/95 backdrop-blur-md" : "bg-white/95 backdrop-blur-md")}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className={cn("font-bold text-xl", !userSettings.darkMode && "text-slate-900")}>Issue Detail</h3>
                  <p className="text-xs text-slate-500 mt-1">Reported {issueTime(selectedIssue.reported_at)}</p>
                </div>
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-2">
                  <span className={cn(
                    "status-badge",
                    selectedIssue.status === 'PENDING' ? 'status-pending' : selectedIssue.status === 'DISPATCHED' ? 'status-dispatched' : 'status-resolved'
                  )}>
                    {selectedIssue.status}
                  </span>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", userSettings.darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")}>
                    {selectedIssue.type}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Description</p>
                  <p className={cn("text-sm leading-relaxed", userSettings.darkMode ? "text-slate-300" : "text-slate-700")}>
                    {selectedIssue.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Location</p>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-blue-500" />
                    <span className={cn(!userSettings.darkMode && "text-slate-900")}>{selectedIssue.location_name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className={cn("p-4 rounded-xl border", userSettings.darkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Urgency</p>
                    <p className={cn("text-lg font-bold", selectedIssue.urgency > 80 ? "text-red-500" : "text-blue-500")}>{selectedIssue.urgency}%</p>
                  </div>
                  <div className={cn("p-4 rounded-xl border", userSettings.darkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Upvotes</p>
                    <p className={cn("text-lg font-bold", !userSettings.darkMode && "text-slate-900")}>{selectedIssue.upvotes}</p>
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Mark as Verified
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function issueTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
