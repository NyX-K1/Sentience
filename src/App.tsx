import { BrowserRouter, Routes, Route } from "react-router-dom"
import Discover from "@/pages/Discover"
import LuminaPage from "@/pages/LuminaPage"
import SentienceLanding from "@/pages/SentienceLanding"
import MindInfo from "@/pages/MindInfo"
import EmotionalUnloading from './pages/EmotionalUnloading';
import WeeklyReport from './pages/WeeklyReport';
import SmartJournal from './pages/SmartJournal';
import SmartJournalling from './pages/SmartJournalling';
import CognitiveReframing from './pages/CognitiveReframing';
import BalancedThoughtPage from './pages/BalancedThoughtPage';
import ScrollAnimationPage from './pages/ScrollAnimationPage';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ScrollAnimationPage />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/lumina" element={<LuminaPage />} />
                <Route path="/sentience" element={<SentienceLanding />} />
                <Route path="/mind-info" element={<MindInfo />} />
                <Route path="/emotional-unloading" element={<EmotionalUnloading />} />
                <Route path="/weekly-report" element={<WeeklyReport />} />
                <Route path="/smart-journal" element={<SmartJournal />} />
                <Route path="/smart-journalling" element={<SmartJournalling />} />
                <Route path="/cognitive-reframing" element={<CognitiveReframing />} />
                <Route path="/balanced-thought" element={<BalancedThoughtPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App
