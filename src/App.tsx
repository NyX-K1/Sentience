import { BrowserRouter, Routes, Route } from "react-router-dom"
import { BackgroundPaths } from "@/components/ui/background-paths"
import Discover from "@/pages/Discover"
import LuminaPage from "@/pages/LuminaPage"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<BackgroundPaths title="Sentience" />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/lumina" element={<LuminaPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
