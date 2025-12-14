import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PlayPage from "./pages/PlayPage";
import AboutPage from "./pages/AboutPage";
import GuidePage from "./pages/GuidePage";

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play/:songId" element={<PlayPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/guide" element={<GuidePage />} />
      </Routes>
    </div>
  );
}

export default App;
