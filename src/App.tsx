import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PlayPage from "./pages/PlayPage";

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play/:songId" element={<PlayPage />} />
      </Routes>
    </div>
  );
}

export default App;
