import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const Workspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [updatedName, setUpdatedName] = useState('');

  useEffect(() => {
    // Fetch workspaces when component mounts
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = () => {
    setLoading(true);
    fetch('http://localhost:8000/workspace/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("User workspaces fetched:", data);
      setWorkspaces(data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching workspaces:', error);
      setError('Failed to load workspaces. Please try again later.');
      setLoading(false);
    });
  };

  const handleDeleteWorkspace = (id) => {
    if (window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      fetch(`http://localhost:8000/workspace/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Workspace deleted:", data);
        // Remove the deleted workspace from state
        setWorkspaces(workspaces.filter(workspace => workspace.id !== id));
      })
      .catch(error => {
        console.error('Error deleting workspace:', error);
        alert('Failed to delete workspace. Please try again.');
      });
    }
  };

  const openUpdateModal = (workspace) => {
    setCurrentWorkspace(workspace);
    setUpdatedName(workspace.name);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateWorkspace = (e) => {
    e.preventDefault();
    if (!updatedName.trim()) return;

    fetch(`http://localhost:8000/workspace/update/${currentWorkspace.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name: updatedName })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Workspace updated:", data);
      // Update the workspace in state
      setWorkspaces(workspaces.map(workspace => 
        workspace.id === currentWorkspace.id ? { ...workspace, name: updatedName } : workspace
      ));
      // Close modal
      setIsUpdateModalOpen(false);
    })
    .catch(error => {
      console.error('Error updating workspace:', error);
      alert('Failed to update workspace. Please try again.');
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">
              Your Workspaces
            </h2>
          </div>

          {/* Workspaces List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-gray-600">You don't have any workspaces yet.</p>
              <p className="text-gray-600 mt-2">Create one using the "Create Workspace" button in the navbar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 block"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/workspace/${workspace.id}`}>
                      <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-500 transition-colors duration-300 cursor-pointer">
                        {workspace.name}
                      </h3>
                    </Link>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openUpdateModal(workspace)}
                        className="text-gray-500 hover:text-blue-500 transition-colors duration-300"
                        title="Edit Workspace"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors duration-300"
                        title="Delete Workspace"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                      Created: {new Date(workspace.created_at).toLocaleDateString()}
                    </span>
                    <Link to={`/workspace/${workspace.id}`}>
                      <span className="text-blue-500 hover:text-blue-700 font-semibold transition-colors duration-300">
                        View Details
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Update Workspace Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="absolute top-0 right-0 m-4 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold mb-4">Update Workspace</h2>
              <form onSubmit={handleUpdateWorkspace}>
                <div className="mb-4">
                  <label htmlFor="updatedName" className="block text-gray-700 font-bold mb-2">Workspace Name</label>
                  <input
                    type="text"
                    id="updatedName"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 mr-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Workspace;
