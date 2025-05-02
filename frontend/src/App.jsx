import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Authentification/login';
import Register from './pages/Authentification/register';
import Home from './pages/home/home';
import Workspace from './pages/workspace/workspace';
import WorkspaceDetail from './pages/workspace/workSpaceDetail';
import Board from './pages/board/board';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/workspace/:id" element={<WorkspaceDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/board/:id" element={<Board />} />
       
      </Routes>
    </Router>
  );
}

export default App;

