import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { FaChevronLeft, FaChevronRight, FaUsers } from 'react-icons/fa';

const WorkspaceDetail = () => {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState({
    id: parseInt(id),
    name: `Workspace ${id}`,
    members: [],
    boards: []
  });

  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [animateContent, setAnimateContent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true); // New state for sidebar visibility

  const fetchWorkspaceDetails = useCallback(() => {
    setLoading(true);
    
    // Fetch workspace details
    fetch(`http://localhost:8000/workspace/${id}`, {
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
    .then(workspaceData => {
      console.log("Workspace details:", workspaceData);
       
      // Now fetch the workspace members
      fetch(`http://localhost:8000/workspace/members/${id}`, {
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
      .then(membersData => {
        console.log("Workspace members:", membersData);
        
        // Set workspace with both details and members
        setWorkspace({
          ...workspaceData,
          boards: workspaceData.boards || [],
          members: membersData || []
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching workspace members:', error);
        setLoading(false);
      });
    })
    .catch(error => {
      console.error('Error fetching workspace details:', error);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    fetchWorkspaceDetails();
    setTimeout(() => setAnimateContent(true), 100);
  }, [fetchWorkspaceDetails]);

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      setWorkspace({
        ...workspace,
        boards: [
          ...(workspace.boards || []),
          {
            id: (workspace.boards?.length || 0) + 1,
            name: newBoardName,
            members: [],
          },
        ],
      });
      setNewBoardName('');
      setIsCreateBoardOpen(false);
    }
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    
    setAddingMember(true);
    setMemberError('');
    
    fetch(`http://localhost:8000/workspace/new-member/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        email: newMemberEmail,
        role: 'MEMBER'
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || "Failed to add member");
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("Workspace details:", data);
      setWorkspace({
        ...data,
        members: Array.isArray(data.members) ? data.members : [],
        boards: Array.isArray(data.boards) ? data.boards : []
      });
      setNewMemberEmail('');
      setAddingMember(false);
    })
    .catch(error => {
      setMemberError(error.message);
      setAddingMember(false);
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16 flex">
        {/* Sidebar with toggle button */}
        <div className={`relative ${sidebarOpen ? 'w-20' : 'w-0'} transition-all duration-300 ease-in-out`}>
          <aside className={`bg-white shadow-md p-6 fixed h-full left-0 top-16 overflow-y-auto ${sidebarOpen ? 'w-90' : 'w-0'} transition-all duration-300 ease-in-out`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Workspace Members</h3>
              <button 
                onClick={toggleSidebar}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                title="Collapse sidebar"
              >
                <FaChevronLeft className="text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="mb-6">
              <div className="flex flex-col space-y-2">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none text-sm"
                  placeholder="Add member by email"
                  required
                />
                {memberError && (
                  <p className="text-red-500 text-xs">{memberError}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-300"
                  disabled={addingMember}
                >
                  {addingMember ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
            
            {/* Members List */}
            <h4 className="font-semibold text-gray-700 mb-2">Members</h4>
            {loading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : !workspace.members || workspace.members.length === 0 ? (
              <p className="text-gray-600 text-sm">No members yet.</p>
            ) : (
              <ul className="space-y-3">
                {workspace.members.map((member, index) => (
                  <li
                    key={member.id || index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-gray-700 text-sm animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-semibold">
                        {member.first_name ? member.first_name.charAt(0).toUpperCase() : 
                         member.username ? member.username.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {member.first_name && member.last_name 
                            ? `${member.first_name} ${member.last_name}`
                            : member.username || member.email || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">{member.email}</span>
                      </div>
                    </div>
                    {member.groupRole && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        member.groupRole.role === 'OWNER' ? 'bg-purple-100 text-purple-800' : 
                        member.groupRole.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {member.groupRole.role}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>

        {/* Sidebar toggle button when collapsed */}
        {!sidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-r-lg shadow-md hover:bg-gray-100 transition-colors z-10"
            title="Expand sidebar"
          >
            <FaChevronRight className="text-gray-600" />
          </button>
        )}

        {/* Main content */}
        <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300 ease-in-out p-8`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10 animate-slide-down">
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                {workspace.name}
              </h2>
              <button
                onClick={() => setIsCreateBoardOpen(true)}
                className="relative bg-blue-600 text-white px-6 py-3 rounded-full font-semibold overflow-hidden group"
              >
                <span className="relative z-10">Create Board</span>
                <span className="absolute inset-0 bg-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(!workspace.boards || workspace.boards.length === 0) ? (
                <p className="text-gray-600 col-span-full text-center animate-fade-in">
                  No boards yet. Create one to get started!
                </p>
              ) : (
                workspace.boards.map((board, index) => (
                  <div
                    key={board.id}
                    className={`bg-white p-6 rounded-2xl shadow-lg transition-all duration-500 transform hover:shadow-xl hover:-translate-y-2 ${
                      animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <Link to={`/board/${board.id}`}>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 group relative">
                        {board.name}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm">
                      {board.members?.length || 0} member{board.members?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Create Board Modal */}
        {isCreateBoardOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-95 animate-scale-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 animate-fade-in">
                Create New Board
              </h3>
              <form onSubmit={handleCreateBoard}>
                <div className="relative mb-6">
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 peer"
                    placeholder=" "
                    required
                    autoFocus
                  />
                  <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 transform origin-left peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm peer-valid:text-blue-500">
                    Board Name
                  </label>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateBoardOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="relative bg-blue-600 text-white px-6 py-2 rounded-lg overflow-hidden group"
                  >
                    <span className="relative z-10">Create</span>
                    <span className="absolute inset-0 bg-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkspaceDetail;