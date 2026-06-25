import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import IssueCard from '../components/IssueCard';
import { FileText, Camera, Send, PlusCircle, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../supabase/config';

export default function Profile() {
  const { currentUser, reports, submitResolution, verifyResolution, logoutUser } = useStore();
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Active' | 'Under Review' | 'Resolved'
  
  // Resolution modal states
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [afterImage, setAfterImage] = useState(""); 
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 font-inter text-brand-text">
        <h2 className="text-xl font-poppins font-bold text-slate-800">Please Sign In</h2>
        <p className="text-xs text-brand-textSecondary mt-2">
          You need to be logged in to view your profile and verify issue resolutions.
        </p>
      </div>
    );
  }

  // Get current user reports
  const userReports = reports.filter(r => r.userId === currentUser.uid);
  const filteredUserReports = userReports.filter(r => {
    if (activeTab === 'All') return true;
    return r.status === activeTab;
  });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isSupabaseConfigured) {
      setUploadError("Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to upload files.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setAfterImage("");

    try {
      // Programmatically attempt to create bucket if it doesn't exist
      try {
        await supabase.storage.createBucket('issue-evidences', { public: true });
      } catch (err) {
        console.warn("Storage auto-creation skipped/unauthorized:", err.message);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file directly to 'issue-evidences' Supabase Storage Bucket
      const { error } = await supabase.storage
        .from('issue-evidences')
        .upload(filePath, file);

      if (error) {
        throw new Error(error.message);
      }

      // Retrieve public URL
      const { data: { publicUrl } } = supabase.storage
        .from('issue-evidences')
        .getPublicUrl(filePath);

      setAfterImage(publicUrl);
    } catch (error) {
      console.error("Storage upload error:", error);
      let errorMsg = error.message;
      if (errorMsg.toLowerCase().includes("bucket not found") || errorMsg.toLowerCase().includes("does not exist")) {
        errorMsg = "Bucket 'issue-evidences' not found in Supabase. Please open your Supabase Console, go to 'Storage', click 'New Bucket', name it exactly 'issue-evidences', make it PUBLIC, and save it.";
      }
      setUploadError(`File upload failed: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!completionNotes.trim()) return;
    submitResolution(selectedIssueId, {
      afterImage,
      notes: completionNotes.trim()
    });
    setSelectedIssueId(null);
    setCompletionNotes("");
    setAfterImage("");
    setUploadError("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-inter text-brand-text">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Profile Dashboard Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-brand-card rounded-card border border-slate-100 p-6 shadow-soft flex flex-col items-center text-center backdrop-blur-md glow-card">
            <img
              src={currentUser.photoURL}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full object-cover border border-slate-200 shadow-premium mb-4"
            />
            <h2 className="text-lg font-extrabold text-brand-text font-poppins leading-tight">
              {currentUser.name}
            </h2>
            <p className="text-xs text-brand-textSecondary mt-1 truncate w-full font-semibold">
              {currentUser.email}
            </p>
            
            <span className="mt-3.5 bg-blue-50 text-primary-blue text-[9px] font-bold px-2.5 py-0.75 rounded-full border border-blue-100/60 tracking-wider">
              Joined {new Date(currentUser.joinedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
            </span>

            {/* Statistics details */}
            <div className="w-full border-t border-slate-100 mt-6 pt-5 space-y-4 text-xs font-bold">
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-brand-textSecondary">Reputation</span>
                <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/55 flex items-center gap-0.5 shadow-sm">
                  ★ {currentUser.reputation || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-brand-textSecondary">Reports Raised</span>
                <span className="text-primary-blue bg-blue-50/50 px-2.5 py-0.5 rounded-full border border-blue-100/30">
                  {currentUser.totalReports || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-brand-textSecondary">Verified Fixes</span>
                <span className="text-primary-green bg-green-50/50 px-2.5 py-0.5 rounded-full border border-green-100/30">
                  {currentUser.resolvedReports || 0}
                </span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <Link
              to="/report"
              className="w-full mt-6 gradient-btn rounded-btn text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report New Issue</span>
            </Link>
            
            <button
              onClick={() => logoutUser()}
              className="w-full mt-3 bg-slate-50 hover:bg-red-50 hover:text-red-650 border border-slate-200/80 hover:border-red-100 rounded-btn text-brand-textSecondary text-xs font-bold py-2.5 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Column: User Reports Contributions Feed */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Section Tab Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <h2 className="font-poppins font-bold text-base text-brand-text">My Filed Tickets</h2>
            <div className="flex gap-1 overflow-x-auto pb-1 -mb-1 max-w-full whitespace-nowrap">
              {['All', 'Active', 'Under Review', 'Resolved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3.5 py-1.5 rounded-md font-bold transition-colors cursor-pointer border flex-shrink-0 ${
                    activeTab === tab 
                      ? 'bg-slate-100 text-brand-text border-slate-200' 
                      : 'border-transparent text-brand-textSecondary hover:text-brand-text'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* User Reports List */}
          <div className="space-y-6">
            {filteredUserReports.length > 0 ? (
              filteredUserReports.map((report) => (
                <div key={report.id} className="relative group">
                  {/* Embedded Custom Resolution Controls for Report Card */}
                  <IssueCard
                    issue={report}
                    action={
                      <div className="flex gap-2">
                        {report.status !== 'Resolved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIssueId(report.id);
                            }}
                            className="bg-primary-blue hover:bg-blue-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-btn shadow-md flex items-center gap-1 transition-all duration-200 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Simulate Repair Fix</span>
                          </button>
                        )}
                        {report.status === 'Resolved' && !report.resolution?.verifiedByCitizen && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              verifyResolution(report.id);
                            }}
                            className="bg-primary-green hover:bg-emerald-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-btn shadow-md flex items-center gap-1.5 transition-all duration-200 animate-pulse cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Verify Fix (+25 pts)</span>
                          </button>
                        )}
                      </div>
                    }
                  />

                  {/* Resolution Notes Overlay */}
                  {report.status === 'Resolved' && report.resolution && (
                    <div className="bg-green-50/50 border-x border-b border-slate-100 rounded-b-card p-4 -mt-5 pt-7 text-xs text-green-950 font-semibold leading-relaxed">
                      <div className="flex gap-4">
                        {report.resolution.afterImage && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-150 flex-shrink-0">
                            <img
                              src={report.resolution.afterImage}
                              alt="Repaired"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <span className="font-poppins font-bold text-green-700 text-[10px] uppercase tracking-wider block mb-1">
                            ✅ Authority Repair Report
                          </span>
                          <p className="text-slate-700 font-medium">{report.resolution.notes}</p>
                          <span className="text-[9px] text-slate-400 block mt-2 font-bold uppercase tracking-wider">
                            Repaired on {new Date(report.resolution.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-brand-card rounded-card border border-slate-100 p-12 text-center shadow-soft">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-poppins font-bold text-lg text-brand-text">No reports found</h3>
                <p className="text-xs text-brand-textSecondary mt-1 max-w-sm mx-auto font-semibold">
                  You haven't filed any tickets matching this status yet. Click "Report Issue" to create a new ticket.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Resolution Submission Modal Dialog */}
      <AnimatePresence>
        {selectedIssueId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-card shadow-premium border border-slate-200/50 max-w-md w-full p-6 mx-4 text-brand-text font-inter"
            >
              <h3 className="font-poppins font-bold text-base mb-2">Simulate Municipal Resolution</h3>
              <p className="text-xs text-brand-textSecondary mb-4 font-semibold leading-relaxed">
                To mark this issue as repaired by authority teams, upload an "After" resolution image and describe the completed repair work.
              </p>
              
              <form onSubmit={handleResolveSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1.5">
                    Repair Evidence Photo
                  </label>
                  <div className="relative border border-dashed border-slate-300 hover:border-primary-soft rounded-btn bg-slate-50/50 p-6 text-center cursor-pointer transition-colors duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {isUploading ? (
                      <div className="space-y-1.5">
                        <Loader2 className="w-6 h-6 text-primary-blue animate-spin mx-auto" />
                        <span className="text-[10px] font-bold text-slate-500 block">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                        <span className="text-[10px] font-bold text-slate-700 block">Click here to upload photo</span>
                        <span className="text-[8px] text-slate-450 block mt-0.5 font-bold uppercase tracking-wider">PNG, JPG up to 5MB</span>
                      </>
                    )}
                  </div>
                  
                  {uploadError && (
                    <p className="text-[9px] text-red-500 font-semibold mt-1">
                      {uploadError}
                    </p>
                  )}

                  {afterImage && (
                    <div className="mt-3 relative w-full h-28 rounded-btn overflow-hidden border border-slate-200 shadow-sm animate-fade-in">
                      <img src={afterImage} alt="Repair Evidence" className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 right-1.5 bg-green-600 text-white px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 text-white" />
                        <span>Ready</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1.5">
                    Completion & Repair Notes
                  </label>
                  <textarea
                    rows="3"
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    required
                    placeholder="e.g. Municipal public works patched the road cracks and re-paved the section."
                    className="w-full text-xs border border-slate-200 rounded-btn p-2.5 focus:outline-none focus:border-primary-soft bg-slate-50 text-brand-text focus:bg-white font-medium leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs font-semibold pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIssueId(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-btn text-brand-text transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !afterImage}
                    className={`px-4 py-2 bg-primary-blue hover:bg-blue-600 text-white rounded-btn shadow-sm transition-colors flex items-center gap-1.5 font-bold ${
                      (isUploading || !afterImage) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Resolution</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
