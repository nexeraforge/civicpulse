import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../supabase/config';

export const useStore = create((set, get) => {
  return {
    currentUser: null,
    reports: [],
    leaderboard: [],
    activeFilters: {
      category: 'All',
      severity: 'All',
      status: 'All',
      search: ''
    },

    // 1. Supabase Realtime Channel Postgres Sync Hookup
    subscribeToReports: () => {
      if (!isSupabaseConfigured) {
        console.log("Supabase is not configured. Realtime listeners disabled.");
        return () => {};
      }

      // Initial Fetch
      get().fetchReports();
      get().fetchLeaderboard();

      // Subscribe to updates on reports table
      const reportsChannel = supabase
        .channel('realtime-reports')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reports' },
          (payload) => {
            console.log('Realtime reports change:', payload);
            get().fetchReports();
          }
        )
        .subscribe();

      // Subscribe to updates on users table
      const usersChannel = supabase
        .channel('realtime-users')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users' },
          (payload) => {
            console.log('Realtime users change:', payload);
            get().fetchLeaderboard();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(reportsChannel);
        supabase.removeChannel(usersChannel);
      };
    },

    fetchReports: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error("Error fetching reports:", error.message);
      } else if (data) {
        set({ reports: data });
      }
    },

    fetchLeaderboard: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('reputation', { ascending: false });

      if (error) {
        console.error("Error fetching leaderboard:", error.message);
      } else if (data) {
        const formatted = data.map(u => ({
          id: u.id,
          name: u.name,
          photo: u.photoURL,
          reputation: u.reputation || 0,
          reports: u.totalReports || 0,
          resolved: u.resolvedReports || 0
        }));
        set({ leaderboard: formatted });
      }
    },

    // 2. Supabase Google Authentication Actions
    loginWithGoogle: async () => {
      if (!isSupabaseConfigured) {
        console.log("Supabase is not configured. Google Sign-In requires active credentials.");
        return;
      }

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } catch (error) {
        console.error("Supabase OAuth failed:", error.message);
        throw error;
      }
    },

    loginAsDemo: () => {
      const demoUser = {
        uid: 'demo-user-123',
        name: 'demouser',
        email: 'demouser@civicpulse.org',
        photoURL: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%23E2E8F0"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="%2394A3B8"/></svg>',
        joinedDate: new Date().toISOString().split('T')[0],
        totalReports: 2,
        resolvedReports: 1,
        reputation: 120
      };
      set({ currentUser: demoUser });
      get().fetchReports();
      get().fetchLeaderboard();
    },

    syncUserProfile: async (sessionUser) => {
      if (!sessionUser) return;

      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      let userData;
      if (dbUser) {
        userData = {
          uid: sessionUser.id,
          name: dbUser.name,
          email: sessionUser.email,
          photoURL: dbUser.photoURL,
          joinedDate: dbUser.joinedDate || new Date().toISOString().split('T')[0],
          totalReports: dbUser.totalReports || 0,
          resolvedReports: dbUser.resolvedReports || 0,
          reputation: dbUser.reputation || 0
        };
      } else {
        userData = {
          uid: sessionUser.id,
          name: sessionUser.user_metadata?.full_name || sessionUser.email.split('@')[0],
          email: sessionUser.email,
          photoURL: sessionUser.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
          joinedDate: new Date().toISOString().split('T')[0],
          totalReports: 0,
          resolvedReports: 0,
          reputation: 0
        };
        await supabase.from('users').insert([{
          id: userData.uid,
          name: userData.name,
          photoURL: userData.photoURL,
          reputation: userData.reputation,
          totalReports: userData.totalReports,
          resolvedReports: userData.resolvedReports,
          joinedDate: userData.joinedDate
        }]);
      }
      set({ currentUser: userData });
    },

    logoutUser: async () => {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      set({ currentUser: null });
    },

    // 3. Supabase CRUD DB Operations
    addReport: async (newReport) => {
      const user = get().currentUser;
      if (!user) return;

      const reportData = {
        id: `rep-${Date.now()}`,
        userId: user.uid,
        username: user.name,
        userPhoto: user.photoURL,
        userReputation: user.reputation,
        praises: 0,
        praisedBy: [],
        status: "Active",
        createdAt: new Date().toISOString(),
        comments: [],
        resolution: null,
        ...newReport
      };

      if (isSupabaseConfigured && user.uid !== 'demo-user-123') {
        const { error } = await supabase.from('reports').insert([reportData]);
        if (error) {
          console.error("Error creating report:", error.message);
        } else {
          await get().awardPoints(20);

          // Update user stats in Supabase users table
          await supabase
            .from('users')
            .update({ totalReports: (user.totalReports || 0) + 1 })
            .eq('id', user.uid);
        }
      } else {
        // Local-only award points for demo user or if Supabase is offline
        await get().awardPoints(20);
        // Increment totalReports locally
        set(state => ({
          currentUser: state.currentUser ? {
            ...state.currentUser,
            totalReports: (state.currentUser.totalReports || 0) + 1
          } : null
        }));
      }

      // Always insert into local state to keep the interface responsive
      set(state => {
        if (state.reports.some(r => r.id === reportData.id)) {
          return state;
        }
        return { reports: [reportData, ...state.reports] };
      });
    },

    togglePraise: async (reportId) => {
      const userId = get().currentUser?.uid;
      if (!userId) return;

      const report = get().reports.find(r => r.id === reportId);
      if (!report) return;

      const praisedByArr = report.praisedBy || [];
      const alreadyPraised = praisedByArr.includes(userId);
      const updatedPraisedBy = alreadyPraised 
        ? praisedByArr.filter(id => id !== userId)
        : [...praisedByArr, userId];
      
      const newPraisesCount = updatedPraisedBy.length;

      // Optimistically update local state
      set(state => ({
        reports: state.reports.map(r => 
          r.id === reportId 
            ? { ...r, praisedBy: updatedPraisedBy, praises: newPraisesCount } 
            : r
        )
      }));

      if (isSupabaseConfigured && userId !== 'demo-user-123') {
        const { error } = await supabase
          .from('reports')
          .update({ praisedBy: updatedPraisedBy, praises: newPraisesCount })
          .eq('id', reportId);

        if (error) {
          console.error("Error toggling praise:", error.message);
          // Rollback local state
          set(state => ({
            reports: state.reports.map(r => 
              r.id === reportId 
                ? { ...r, praisedBy: praisedByArr, praises: report.praises } 
                : r
            )
          }));
        } else {
          await get().updateReporterReputation(report.userId, alreadyPraised ? -10 : 10);
        }
      } else {
        // Local-only updates
        await get().updateReporterReputation(report.userId, alreadyPraised ? -10 : 10);
      }
    },

    addComment: async (reportId, content) => {
      const user = get().currentUser;
      if (!user) return;

      const report = get().reports.find(r => r.id === reportId);
      if (!report) return;

      const newComment = {
        id: `c-${Date.now()}`,
        userId: user.uid,
        username: user.name,
        userPhoto: user.photoURL,
        content,
        createdAt: new Date().toISOString()
      };

      const updatedComments = [...(report.comments || []), newComment];

      // Optimistically update local state
      set(state => ({
        reports: state.reports.map(r => 
          r.id === reportId ? { ...r, comments: updatedComments } : r
        )
      }));

      if (isSupabaseConfigured && user.uid !== 'demo-user-123') {
        const { error } = await supabase
          .from('reports')
          .update({ comments: updatedComments })
          .eq('id', reportId);

        if (error) {
          console.error("Error adding comment:", error.message);
          // Rollback local state
          set(state => ({
            reports: state.reports.map(r => 
              r.id === reportId ? { ...r, comments: updatedComments } : r
            )
          }));
        } else {
          await get().awardPoints(5);
        }
      } else {
        await get().awardPoints(5);
      }
    },

    submitResolution: async (reportId, resolutionData) => {
      const report = get().reports.find(r => r.id === reportId);
      if (!report) return;

      const resolution = {
        afterImage: resolutionData.afterImage,
        notes: resolutionData.notes,
        completedAt: new Date().toISOString(),
        verifiedByCitizen: false
      };

      // Optimistically update local state
      set(state => ({
        reports: state.reports.map(r => 
          r.id === reportId ? { ...r, status: 'Resolved', resolution } : r
        )
      }));

      if (isSupabaseConfigured && get().currentUser?.uid !== 'demo-user-123') {
        const { error } = await supabase
          .from('reports')
          .update({ status: 'Resolved', resolution })
          .eq('id', reportId);

        if (error) {
          console.error("Error submitting resolution:", error.message);
          // Rollback local state
          set(state => ({
            reports: state.reports.map(r => 
              r.id === reportId ? { ...r, status: report.status, resolution: report.resolution } : r
            )
          }));
        } else if (report.userId) {
          // Award 50 coins/reputation points to the original reporter
          await get().updateReporterReputation(report.userId, 50);
        }
      } else if (report.userId) {
        // Local-only update
        await get().updateReporterReputation(report.userId, 50);
      }
    },

    verifyResolution: async (reportId) => {
      const user = get().currentUser;
      if (!user) return;

      const report = get().reports.find(r => r.id === reportId);
      if (!report || !report.resolution) return;

      const updatedResolution = { ...report.resolution, verifiedByCitizen: true };

      // Optimistically update local state
      set(state => ({
        reports: state.reports.map(r => 
          r.id === reportId ? { ...r, resolution: updatedResolution } : r
        )
      }));

      if (isSupabaseConfigured && user.uid !== 'demo-user-123') {
        const { error } = await supabase
          .from('reports')
          .update({ resolution: updatedResolution })
          .eq('id', reportId);
        
        if (error) {
          console.error("Error verifying resolution:", error.message);
          // Rollback local state
          set(state => ({
            reports: state.reports.map(r => 
              r.id === reportId ? { ...r, resolution: report.resolution } : r
            )
          }));
        } else {
          await get().awardPoints(25);

          await supabase
            .from('users')
            .update({ resolvedReports: (user.resolvedReports || 0) + 1 })
            .eq('id', user.uid);
        }
      } else {
        await get().awardPoints(25);
        // Local update of resolvedReports
        set(state => ({
          currentUser: state.currentUser ? {
            ...state.currentUser,
            resolvedReports: (state.currentUser.resolvedReports || 0) + 1
          } : null
        }));
      }
    },

    setFilters: (newFilters) => {
      set(state => ({
        activeFilters: { ...state.activeFilters, ...newFilters }
      }));
    },

    // 4. Gamification points updates
    awardPoints: async (points) => {
      const user = get().currentUser;
      if (!user) return;

      const newRep = user.reputation + points;
      const updatedUser = { ...user, reputation: newRep };

      if (isSupabaseConfigured && user.uid !== 'demo-user-123') {
        await supabase
          .from('users')
          .update({ reputation: newRep })
          .eq('id', user.uid);
      }
      set({ currentUser: updatedUser });
    },

    updateReporterReputation: async (authorId, change) => {
      if (isSupabaseConfigured && authorId !== 'demo-user-123') {
        // Fetch current reporter reputation
        const { data } = await supabase
          .from('users')
          .select('reputation')
          .eq('id', authorId)
          .single();

        if (data) {
          const currentRep = data.reputation || 0;
          await supabase
            .from('users')
            .update({ reputation: currentRep + change })
            .eq('id', authorId);
        }
      } else {
        // Local-only update for leaderboard users
        set(state => ({
          leaderboard: state.leaderboard.map(u => 
            u.id === authorId ? { ...u, reputation: u.reputation + change } : u
          )
        }));
      }
    },

    deleteReport: async (reportId) => {
      const user = get().currentUser;
      if (!user) return;

      const report = get().reports.find(r => r.id === reportId);
      if (!report || report.userId !== user.uid) return;

      if (isSupabaseConfigured && user.uid !== 'demo-user-123') {
        const { error } = await supabase
          .from('reports')
          .delete()
          .eq('id', reportId);

        if (error) {
          console.error("Error deleting report:", error.message);
          return;
        }

        // Decrement user's totalReports count
        const newReportCount = Math.max(0, (user.totalReports || 0) - 1);
        await supabase
          .from('users')
          .update({ totalReports: newReportCount })
          .eq('id', user.uid);

        // Update local currentUser state
        set({ currentUser: { ...user, totalReports: newReportCount } });

        // Update local reports state instantly
        set(state => ({
          reports: state.reports.filter(r => r.id !== reportId)
        }));
      } else {
        // Local-only delete
        const newReportCount = Math.max(0, (user.totalReports || 0) - 1);
        set({ currentUser: { ...user, totalReports: newReportCount } });
        set(state => ({
          reports: state.reports.filter(r => r.id !== reportId)
        }));
      }
    },

    resetDatabase: async () => {
      if (isSupabaseConfigured) {
        // Option to purge local profile
        set({ currentUser: null, reports: [], leaderboard: [] });
      }
    }
  };
});
