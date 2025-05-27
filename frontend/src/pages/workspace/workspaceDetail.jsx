import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link} from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { FaChevronLeft, FaChevronRight, FaTrash, FaEdit, FaUsers, FaPlus, FaTasks } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const WorkspaceDetail = () => {
  const { id } = useParams();
  // const navigate = useNavigate();
  const [workspace, setWorkspace] = useState({
    id: parseInt(id),
    name: `Workspace ${id}`,
    members: [],
    boards: []
  });

  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [animateContent, setAnimateContent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [isOwner, setIsOwner] = useState(false);

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
      // Fetch boards for this workspace
      fetch(`http://localhost:8000/board/all/${id}`, {
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
      .then(boardsData => {
        // Fetch workspace members
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
          // Check if current user is owner
          const currentUserId = parseInt(localStorage.getItem('userId'));
          const currentUserRole = membersData.find(member =>
            member.id === currentUserId
          )?.groupRole?.role;

          setIsOwner(currentUserRole === 'OWNER');

          setWorkspace({
            ...workspaceData,
            boards: boardsData || [],
            members: membersData || []
          });
          setLoading(false);
        })
      })
    })
    .catch(error => {
      console.error('Error fetching data:', error);
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
      fetch('http://localhost:8000/board/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newBoardName,
          workspace: id
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setWorkspace(prev => ({
          ...prev,
          boards: [...prev.boards, data]
        }));
        setNewBoardName('');
        setIsCreateBoardOpen(false);
      })
      .catch(error => {
        console.error('Error creating board:', error);
        alert('Failed to create board');
      });
    }
  };

  const handleUpdateBoard = (e) => {
    e.preventDefault();
    if (newBoardName.trim() && currentBoard) {
      fetch(`http://localhost:8000/board/update/${currentBoard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newBoardName
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(updatedBoard => {
        setWorkspace(prev => ({
          ...prev,
          boards: prev.boards.map(board =>
            board.id === updatedBoard.id ? updatedBoard : board
          )
        }));
        setNewBoardName('');
        setIsEditBoardOpen(false);
      })
      .catch(error => {
        console.error('Error updating board:', error);
        alert('Failed to update board');
      });
    }
  };

  const handleDeleteBoard = (boardId) => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      fetch(`http://localhost:8000/board/delete/${boardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setWorkspace(prev => ({
          ...prev,
          boards: prev.boards.filter(board => board.id !== boardId)
        }));
      })
      .catch(error => {
        console.error('Error deleting board:', error);
        alert('Failed to delete board');
      });
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
      setWorkspace(prev => ({
        ...prev,
        members: Array.isArray(data.members) ? data.members : []
      }));
      setNewMemberEmail('');
      setAddingMember(false);
    })
    .catch(error => {
      setMemberError(error.message);
      setAddingMember(false);
    });
  };

  const handleDeleteMember = (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    fetch(`http://localhost:8000/workspace/remove-member/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        member_id: memberId
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to remove member');
      }
      setWorkspace(prev => ({
        ...prev,
        members: prev.members.filter(member => member.id !== memberId)
      }));
    })
    .catch(error => {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const openEditBoardModal = (board) => {
    setCurrentBoard(board);
    setNewBoardName(board.name);
    setIsEditBoardOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 flex relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-purple-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className={`relative ${sidebarOpen ? 'w-22' : 'w-0'} transition-all duration-500 ease-in-out z-20`}
        >
          <aside className={`bg-white/95 backdrop-blur-sm shadow-2xl border-r border-white/20 p-6 fixed h-full left-0 top-16 overflow-y-auto ${sidebarOpen ? 'w-96' : 'w-0'} transition-all duration-500 ease-in-out`}>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <FaUsers className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Team Members
                </h3>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
                title="Collapse sidebar"
              >
                <FaChevronLeft className="text-gray-600 group-hover:text-gray-800 transition-colors" />
              </button>
            </div>

            <motion.form
              onSubmit={handleAddMember}
              className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm transition-all duration-300"
                    placeholder="Enter member's email address"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaPlus className="text-gray-400" />
                  </div>
                </div>
                <AnimatePresence>
                  {memberError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-xs bg-red-50 p-2 rounded-lg"
                    >
                      {memberError}
                    </motion.p>
                  )}
                </AnimatePresence>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={addingMember}
                >
                  {addingMember ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Adding...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <FaPlus />
                      <span>Add Member</span>
                    </div>
                  )}
                </button>
              </div>
            </motion.form>

            <div className="mb-4">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <span>Team Members</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {workspace.members?.length || 0}
                </span>
              </h4>
            </div>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col justify-center items-center h-32"
              >
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200"></div>
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                </div>
                <p className="mt-3 text-gray-600 text-sm">Loading members...</p>
              </motion.div>
            ) : !workspace.members || workspace.members.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"
              >
                <FaUsers className="mx-auto text-gray-400 text-2xl mb-3" />
                <p className="text-gray-600 text-sm">No members yet</p>
                <p className="text-gray-500 text-xs mt-1">Add team members to collaborate</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {workspace.members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {member.first_name ? member.first_name.charAt(0).toUpperCase() :
                             member.username ? member.username.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">
                            {member.first_name && member.last_name
                              ? `${member.first_name} ${member.last_name}`
                              : member.username || member.email || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500">{member.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {member.groupRole && (
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            member.groupRole.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                            member.groupRole.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {member.groupRole.role}
                          </span>
                        )}
                        {isOwner && member.groupRole?.role !== 'OWNER' && (
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-2 rounded-xl hover:bg-red-50 transition-all duration-300 group opacity-0 group-hover:opacity-100"
                            title="Remove member"
                          >
                            <FaTrash className="text-gray-400 group-hover:text-red-500 transition-colors text-sm" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </aside>
        </motion.div>

        {/* Sidebar toggle button when collapsed */}
        <AnimatePresence>
          {!sidebarOpen && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={toggleSidebar}
              className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-300 z-30 border border-white/20"
              title="Expand sidebar"
            >
              <FaChevronRight className="text-gray-600" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className={`flex-1 ${sidebarOpen ? 'ml-96' : 'ml-0'} transition-all duration-500 ease-in-out p-8 relative z-10`}>
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 space-y-4 sm:space-y-0"
            >
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {workspace.name}
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your boards and collaborate with your team
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateBoardOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3"
              >
                <FaPlus className="text-lg" />
                <span>Create Board</span>
              </motion.button>
            </motion.div>

            {(!workspace.boards || workspace.boards.length === 0) ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="col-span-full bg-white/70 backdrop-blur-sm p-16 rounded-3xl shadow-xl border border-white/20 text-center max-w-2xl mx-auto"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <FaTasks className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No boards yet</h3>
                <p className="text-gray-600 text-lg mb-6">Create your first board to start organizing your tasks</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreateBoardOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Your First Board
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, staggerChildren: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {workspace.boards.map((board, index) => (
                  <motion.div
                    key={board.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/20 transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:bg-white/90"
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <FaTasks className="w-6 h-6 text-white" />
                          </div>
                          <Link to={`/board/${board.id}`}>
                            <h3 className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300 cursor-pointer mb-2">
                              {board.name}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-sm">
                            Created {new Date(board.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => openEditBoardModal(board)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-300"
                            title="Edit Board"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBoard(board.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                            title="Delete Board"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-2xl">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-800">{board.tasks?.length || 0}</div>
                          <div className="text-xs text-gray-500">Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {board.tasks?.filter(task => task.status === 'done').length || 0}
                          </div>
                          <div className="text-xs text-gray-500">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {board.tasks?.filter(task => task.status === 'not-done').length || 0}
                          </div>
                          <div className="text-xs text-gray-500">Pending</div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-center">
                        <Link to={`/board/${board.id}`} className="w-full">
                          <button className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                            Open Board
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </main>

        {/* Create Board Modal */}
        <AnimatePresence>
          {isCreateBoardOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/20"
              >
                {/* Header */}
                <div className="mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    <FaPlus className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">Create New Board</h3>
                  <p className="text-gray-600">Give your board a descriptive name</p>
                </div>

                {/* Form */}
                <form onSubmit={handleCreateBoard} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Board Name
                    </label>
                    <input
                      type="text"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Enter board name"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCreateBoardOpen(false)}
                      className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-medium transition-all duration-300 hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Create Board
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Board Modal */}
        <AnimatePresence>
          {isEditBoardOpen && currentBoard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/20"
              >
                {/* Header */}
                <div className="mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <FaEdit className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">Edit Board</h3>
                  <p className="text-gray-600">Update your board information</p>
                </div>

                {/* Form */}
                <form onSubmit={handleUpdateBoard} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Board Name
                    </label>
                    <input
                      type="text"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Enter board name"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col space-y-3 pt-4">
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditBoardOpen(false)}
                        className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-medium transition-all duration-300 hover:scale-105"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Update Board
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteBoard(currentBoard.id)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Delete Board
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default WorkspaceDetail;
