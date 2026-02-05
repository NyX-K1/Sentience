import { BrowserRouter, Routes, Route } from "react-router-dom"
import { BackgroundPaths } from "@/components/ui/background-paths"
import Discover from "@/pages/Discover"
import LuminaPage from "@/pages/LuminaPage"
import SentienceLanding from "@/pages/SentienceLanding"
import MindInfo from "@/pages/MindInfo"
import EmotionalUnloading from './pages/EmotionalUnloading';
import WeeklyReport from './pages/WeeklyReport';
import SmartJournal from './pages/SmartJournal';
import CognitiveReframing from './pages/CognitiveReframing';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Discover />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/lumina" element={<LuminaPage />} />
                <Route path="/sentience" element={<SentienceLanding />} />
                <Route path="/mind-info" element={<MindInfo />} />
                <Route path="/emotional-unloading" element={<EmotionalUnloading />} />
                <Route path="/weekly-report" element={<WeeklyReport />} />
                <Route path="/smart-journal" element={<SmartJournal />} />
                <Route path="/cognitive-reframing" element={<CognitiveReframing />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App
