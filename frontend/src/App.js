import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Workspace from './pages/workspace/workspace';
// Import other components

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/workspace/:id" element={<WorkspaceDetail />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App;