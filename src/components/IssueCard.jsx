import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Heart, MessageSquare, MapPin, Share2, Send, CheckCircle2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IssueCard({ issue, action }) {
  const { currentUser, togglePraise, addComment, deleteReport } = useStore();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [copied, setCopied] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [imageLabel, setImageLabel] = useState("");
  const navigate = useNavigate();

  const isPraised = currentUser ? (issue.praisedBy || []).includes(currentUser.uid) : false;

  const handlePraise = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    togglePraise(issue.id);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;
    addComment(issue.id, newComment.trim());
    setNewComment("");
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/explore?issue=${issue.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const navigateToMap = (e) => {
    e.stopPropagation();
    navigate(`/maps?lat=${issue.latitude}&lng=${issue.longitude}&id=${issue.id}`);
  };

  // Severity style mapper
  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return { bg: 'bg-red-50 text-red-700 border-red-200/60', dot: 'bg-red-500 shadow-glow-danger' };
      case 'high':
        return { bg: 'bg-orange-50 text-orange-700 border-orange-200/60', dot: 'bg-orange-500 shadow-glow-warning' };
      case 'medium':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-500' };
      default:
        return { bg: 'bg-green-50 text-green-700 border-green-200/60', dot: 'bg-green-500 shadow-glow-success' };
    }
  };

  // Status style mapper
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'under review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const severityStyle = getSeverityStyle(issue.severity);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="bg-brand-card rounded-card shadow-soft hover:shadow-premium border border-slate-100/80 overflow-hidden transition-all duration-300 glow-card"
    >
      {/* User Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={issue.userPhoto}
            alt={issue.username}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-brand-text leading-tight">{issue.username}</span>
              {issue.userReputation && (
                <span className="bg-slate-100 text-slate-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                  ★ {issue.userReputation}
                </span>
              )}
            </div>
            <p className="text-[10px] text-brand-textSecondary mt-0.5 font-semibold">
              {new Date(issue.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Status Badge & Delete option */}
        <div className="flex items-center gap-2.5 flex-wrap justify-start sm:justify-end">
          {action}
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(issue.status)}`}>
            {issue.status === 'Resolved' && issue.resolution?.verifiedByCitizen ? 'Verified Resolution' : issue.status}
          </span>
          {currentUser && issue.userId === currentUser.uid && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
                  deleteReport(issue.id);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
              title="Delete Report"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content & Description */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Category Badge */}
          <span className="bg-primary-blue/5 text-primary-blue text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.75 rounded-full border border-primary-blue/10">
            {issue.category}
          </span>
          {/* Severity Tag */}
          <span className={`flex items-center gap-1.5 px-2.5 py-0.75 rounded-full text-[10px] font-bold uppercase tracking-wider border ${severityStyle.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${severityStyle.dot}`} />
            {issue.severity} Severity
          </span>
        </div>

        <h3 className="text-base font-bold text-brand-text font-poppins mb-1.5 leading-snug hover:text-primary-blue cursor-pointer transition-colors" onClick={navigateToMap}>
          {issue.title}
        </h3>
        <p className="text-xs text-brand-textSecondary leading-relaxed whitespace-pre-line line-clamp-3 hover:line-clamp-none transition-all duration-300 font-semibold">
          {issue.description}
        </p>

        {issue.status === 'Resolved' && issue.resolution?.notes && (
          <div className="mt-3.5 bg-green-50 rounded-2xl border border-green-100 p-3.5 text-xs leading-relaxed text-slate-700">
            <span className="font-poppins font-bold text-primary-green flex items-center gap-1.5 mb-1.5">
              ✅ Repair Resolution Notes
            </span>
            <p className="font-medium text-slate-600 italic">"{issue.resolution.notes}"</p>
          </div>
        )}

        {/* Location display */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mt-3.5">
          <MapPin className="w-3.5 h-3.5 text-primary-blue flex-shrink-0" />
          <span className="truncate">{issue.location}</span>
        </div>
      </div>

      {/* Media Image or Resolved Before/After Grid */}
      {issue.status === 'Resolved' && issue.resolution?.afterImage ? (
        <div className="grid grid-cols-2 gap-3 px-5 pb-3">
          {/* Before Image */}
          {issue.images && issue.images.length > 0 && (
            <div 
              className="h-44 rounded-xl overflow-hidden relative cursor-pointer group border border-slate-100" 
              onClick={(e) => {
                e.stopPropagation();
                setExpandedImage(issue.images[0]);
                setImageLabel("Before (Hazard)");
              }}
            >
              <img
                src={issue.images[0]}
                alt={`${issue.title} Before`}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 bg-red-600/90 text-white px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-md">
                Before (Hazard)
              </span>
            </div>
          )}
          {/* After Image */}
          <div 
            className="h-44 rounded-xl overflow-hidden relative cursor-pointer group border border-slate-100" 
            onClick={(e) => {
              e.stopPropagation();
              setExpandedImage(issue.resolution.afterImage);
              setImageLabel("After (Resolved)");
            }}
          >
            <img
              src={issue.resolution.afterImage}
              alt={`${issue.title} After`}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
            <span className="absolute top-2 left-2 bg-green-600/95 text-white px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-md">
              After (Resolved)
            </span>
          </div>
        </div>
      ) : (
        issue.images && issue.images.length > 0 && (
          <div 
            className="w-full h-60 overflow-hidden relative cursor-pointer group border-y border-slate-100" 
            onClick={(e) => {
              e.stopPropagation();
              setExpandedImage(issue.images[0]);
              setImageLabel(issue.status === 'Resolved' ? "Resolved Issue" : "Active Hazard");
            }}
          >
            <img
              src={issue.images[0]}
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            {issue.status === 'Resolved' && (
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center">
                <div className="bg-white/95 px-4 py-2 rounded-full shadow-premium border border-slate-100 flex items-center gap-2 text-primary-green text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-primary-green fill-green-100" />
                  <span>Issue Resolved</span>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* AI Analysis Snapshot in Expandable Alert */}
      {issue.aiAnalysis && (
        <div className="px-5 pt-3">
          <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-3.5 text-xs leading-relaxed">
            <span className="font-poppins font-bold text-primary-blue flex items-center gap-1.5 mb-1.5">
              🤖 Gemini AI Impact Assessment
            </span>
            <p className="font-bold text-slate-700 mb-1">
              <span className="font-extrabold text-slate-500">Urgency: </span>{issue.aiAnalysis.urgency}
            </p>
            <p className="text-slate-600 font-bold">
              <span className="font-extrabold text-slate-500">Community Impact: </span>{issue.aiAnalysis.impact}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Actions Panel */}
      <div className="p-4 border-t border-slate-100/80 flex items-center justify-between text-brand-textSecondary text-xs font-semibold bg-slate-50/40">
        <div className="flex items-center gap-3">
          {/* Praise Action */}
          <button
            onClick={handlePraise}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-red-50 hover:text-red-500 transition-all duration-150 cursor-pointer ${isPraised ? 'text-red-500 bg-red-50' : ''}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isPraised ? 'fill-red-500 text-red-500 scale-110' : ''} transition-transform duration-200`} />
            <span>{issue.praises} Praises</span>
          </button>

          {/* Comments Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-blue-50 hover:text-primary-blue transition-all duration-150 cursor-pointer ${showComments ? 'text-primary-blue bg-blue-50' : ''}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{issue.comments ? issue.comments.length : 0} Comments</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Map Redirect */}
          <button
            onClick={navigateToMap}
            className="flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-slate-100 hover:text-primary-blue transition-all duration-150 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>View Map</span>
          </button>

          {/* Share Action */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-slate-100 hover:text-brand-text transition-all duration-150 relative cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-100 overflow-hidden bg-slate-50/40"
          >
            <div className="p-4 space-y-4">
              {/* Comment input form */}
              {currentUser ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a helpful comment (+5 points)..."
                    className="flex-1 text-xs border border-slate-200 rounded-btn px-3 py-2 bg-white focus:outline-none focus:border-primary-soft focus:ring-1 focus:ring-primary-soft/30 text-brand-text"
                  />
                  <button
                    type="submit"
                    className="bg-primary-blue hover:bg-blue-600 text-white rounded-btn px-3.5 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <p className="text-xs text-brand-textSecondary text-center bg-white py-2 rounded-btn border border-slate-100">
                  Please <span className="text-primary-blue cursor-pointer font-bold hover:underline" onClick={() => navigate('/login')}>Sign In</span> to write a comment.
                </p>
              )}

              {/* Comments list */}
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {issue.comments && issue.comments.length > 0 ? (
                  issue.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5 items-start text-xs bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                      <img
                        src={comment.userPhoto}
                        alt={comment.username}
                        className="w-7 h-7 rounded-full object-cover border border-slate-100"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-slate-700">{comment.username}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {new Date(comment.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-normal font-medium">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-brand-textSecondary text-center py-4 font-semibold italic">
                    No comments yet. Be the first to start the conversation!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Lightbox Image Viewer */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedImage(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute -top-12 right-0 sm:right-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-all cursor-pointer border border-white/10 hover:scale-105 active:scale-95 flex items-center justify-center"
                title="Close Image Viewer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main Image */}
              <img
                src={expandedImage}
                alt={imageLabel || issue.title}
                className="max-w-full max-h-[70vh] object-contain rounded-card shadow-2xl border border-white/5"
              />

              {/* Image Label / Details Banner */}
              <div className="mt-4 text-center text-white space-y-1">
                {imageLabel && (
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.75 rounded-full ${
                    imageLabel.includes("Before") 
                      ? "bg-red-500/90 text-white animate-pulse" 
                      : imageLabel.includes("After") 
                      ? "bg-green-500/90 text-white" 
                      : "bg-primary-blue/90 text-white"
                  }`}>
                    {imageLabel}
                  </span>
                )}
                <h4 className="font-poppins font-extrabold text-sm sm:text-base leading-tight max-w-lg mt-1 px-4">
                  {issue.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-primary-blue" />
                  {issue.location}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
