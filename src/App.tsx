import { BrowserRouter, Routes, Route } from "react-router-dom"
import Discover from "@/pages/Discover"
import LuminaPage from "@/pages/LuminaPage"
import SentienceLanding from "@/pages/SentienceLanding"
import MindInfo from "@/pages/MindInfo"
import EmotionalUnloading from './pages/EmotionalUnloading';
import WeeklyReport from './pages/WeeklyReport';
import VoiceNotes from './pages/VoiceNotes';
import EmotionalPatterns from './pages/EmotionalPatterns';
import MoodTracker from './pages/MoodTracker';
import ThoughtReframer from './pages/ThoughtReframer';
import SmartJournalling2 from './pages/SmartJournalling2';
import Diary from './pages/Diary';
import UserAnalytics from './pages/UserAnalytics';
import DataExport from './pages/DataExport';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
};

const RootRoute = () => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    return <Navigate to="/sentience" replace />;
};

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<RootRoute />} />
                    <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
                    <Route path="/lumina" element={<ProtectedRoute><LuminaPage /></ProtectedRoute>} />
                    <Route path="/sentience" element={<ProtectedRoute><SentienceLanding /></ProtectedRoute>} />
                    <Route path="/mind-info" element={<ProtectedRoute><MindInfo /></ProtectedRoute>} />
                    <Route path="/emotional-unloading" element={<ProtectedRoute><EmotionalUnloading /></ProtectedRoute>} />
                    <Route path="/emotional-patterns" element={<ProtectedRoute><EmotionalPatterns /></ProtectedRoute>} />
                    <Route path="/weekly-report" element={<ProtectedRoute><WeeklyReport /></ProtectedRoute>} />
                    <Route path="/smart-journalling" element={<ProtectedRoute><SmartJournalling2 /></ProtectedRoute>} />
                    <Route path="/voice-notes" element={<ProtectedRoute><VoiceNotes /></ProtectedRoute>} />
                    <Route path="/mood-tracker" element={<ProtectedRoute><MoodTracker /></ProtectedRoute>} />
                    <Route path="/thought-reframer" element={<ProtectedRoute><ThoughtReframer /></ProtectedRoute>} />
                    <Route path="/user-analytics" element={<ProtectedRoute><UserAnalytics /></ProtectedRoute>} />
                    <Route path="/data-export" element={<ProtectedRoute><DataExport /></ProtectedRoute>} />
                    <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App
