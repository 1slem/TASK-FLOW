import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { AnimatePresence, motion } from 'framer-motion';
import { FaPlus, FaTasks, FaEdit, FaTrash, FaClock, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const Board = () => {
  const { id: boardId } = useParams(); // This is the board ID from the URL
  const navigate = useNavigate();
  const [board, setBoard] = useState(null); // Store the current board
  const [workspace, setWorkspace] = useState(null); // Store the workspace info
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isUpdateTaskOpen, setIsUpdateTaskOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskStatus, setNewTaskStatus] = useState("not-done");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);

  // Group tasks by priority for the current board
  const groupedTasks = {
    high: board?.tasks ? board.tasks.filter(task => task.priority === "high") : [],
    medium: board?.tasks ? board.tasks.filter(task => task.priority === "medium") : [],
    low: board?.tasks ? board.tasks.filter(task => task.priority === "low") : []
  };

  // Debug logging
  console.log("Board ID from URL:", boardId);
  console.log("Current board state:", board);
  console.log("Grouped tasks:", groupedTasks);
  console.log("Loading state:", loading);
  console.log("Error state:", error);
  console.log("Access denied state:", accessDenied);

  // Fetch the specific board and its data
  useEffect(() => {
    const fetchBoardData = async () => {
      setLoading(true);
      setError(null);
      setAccessDenied(false);

      try {
        // Fetch the specific board by ID
        const response = await axios.get(`http://localhost:8000/board/${boardId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const boardData = response.data;
        console.log("Board data received:", boardData);
        console.log("Board tasks:", boardData.tasks);
        setBoard(boardData);
        setWorkspace(boardData.workspace);

        // Fetch workspace members for task assignment
        const workspaceResponse = await axios.get(`http://localhost:8000/workspace/members/${boardData.workspace.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Note: Access control is handled by the backend API
        // If we reach this point, the user has permission to access this workspace

        setWorkspaceMembers(workspaceResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching board data:", err);
        console.error("Error response:", err.response);
        console.error("Error status:", err.response?.status);
        console.error("Error data:", err.response?.data);
        console.error("Request URL:", `http://localhost:8000/board/${boardId}`);
        console.error("Token:", localStorage.getItem('token'));

        if (err.response?.status === 403) {
          setAccessDenied(true);
        } else if (err.response?.status === 404) {
          setError("Board not found");
        } else {
          setError("Failed to load board data. Please try again later.");
        }
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoardData();
    }
  }, [boardId]);

  // Create a new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!board) {
      alert("Board not loaded. Please wait and try again.");
      return;
    }

    if (newTaskName.trim()) {
      try {
        const response = await axios.post(`http://localhost:8000/task/create/${board.id}`, {
          name: newTaskName,
          description: newTaskDescription,
          priority: newTaskPriority,
          status: newTaskStatus,
          assigned_to_id: newTaskAssignedTo || null
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Add the new task to the current board
        const newTask = response.data.task;
        setBoard(prevBoard => ({
          ...prevBoard,
          tasks: [...(prevBoard.tasks || []), newTask]
        }));

        // Reset form
        setNewTaskName("");
        setNewTaskDescription("");
        setNewTaskPriority("medium");
        setNewTaskStatus("not-done");
        setNewTaskAssignedTo("");
        setIsCreateTaskOpen(false);
      } catch (err) {
        console.error("Error creating task:", err);
        alert("Failed to create task. Please try again.");
      }
    }
  };

  // Update an existing task
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!board || !selectedTask) {
      alert("No board or task selected.");
      return;
    }

    if (newTaskName.trim()) {
      try {
        const response = await axios.put(
          `http://localhost:8000/task/update/${board.id}/t/${selectedTask.id}`,
          {
            name: newTaskName,
            description: newTaskDescription,
            priority: newTaskPriority,
            status: newTaskStatus,
            assigned_to_id: newTaskAssignedTo || null
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        // Update the task in the current board
        const updatedTask = response.data;
        setBoard(prevBoard => ({
          ...prevBoard,
          tasks: prevBoard.tasks.map(task =>
            task.id === selectedTask.id ? updatedTask : task
          )
        }));

        // Reset form
        setNewTaskName("");
        setNewTaskDescription("");
        setNewTaskPriority("medium");
        setNewTaskStatus("not-done");
        setNewTaskAssignedTo("");
        setIsUpdateTaskOpen(false);
        setSelectedTask(null);
      } catch (err) {
        console.error("Error updating task:", err);
        alert("Failed to update task. Please try again.");
      }
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    if (!board) {
      alert("Board not loaded.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`http://localhost:8000/task/delete/${board.id}/t/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Remove the task from the current board
        setBoard(prevBoard => ({
          ...prevBoard,
          tasks: prevBoard.tasks.filter(task => task.id !== taskId)
        }));

        // Close modal if the deleted task was selected
        if (selectedTask && selectedTask.id === taskId) {
          setIsUpdateTaskOpen(false);
          setSelectedTask(null);
        }
      } catch (err) {
        console.error("Error deleting task:", err);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  // Handle task status update
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    if (!board) {
      alert("Board not loaded.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8000/task/status/${board.id}/t/${taskId}`,
        {
          status: newStatus
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update the task in the current board
      const updatedTask = response.data;
      setBoard(prevBoard => ({
        ...prevBoard,
        tasks: prevBoard.tasks.map(task =>
          task.id === taskId ? updatedTask : task
        )
      }));
    } catch (err) {
      console.error("Error updating task status:", err);
      alert("Failed to update task status. Please try again.");
    }
  };

  // Open the update modal for a task
  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setNewTaskName(task.name);
    setNewTaskDescription(task.description || "");
    setNewTaskPriority(task.priority);
    setNewTaskStatus(task.status || "not-done");
    setNewTaskAssignedTo(task.assigned_to ? task.assigned_to.id : "");
    setIsUpdateTaskOpen(true);
  };

  const getPriorityHeaderColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800";
      case "semi-done":
        return "bg-yellow-100 text-yellow-800";
      case "not-done":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "done":
        return "Done";
      case "semi-done":
        return "Semi-done";
      case "not-done":
        return "Not done";
      default:
        return "Unknown";
    }
  };

  const getUserDisplayName = (user) => {
    if (!user) return null;
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-purple-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            {/* Skeleton Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 space-y-4 sm:space-y-0"
            >
              <div className="flex-1">
                <div className="h-12 w-80 bg-gray-200 rounded-2xl animate-pulse mb-4"></div>
                <div className="h-6 w-64 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-14 w-40 bg-gray-200 rounded-2xl animate-pulse"></div>
            </motion.div>

            {/* Skeleton Task Groups */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex space-x-6 overflow-x-auto pb-6"
            >
              {['high', 'medium', 'low'].map((priority, priorityIndex) => (
                <motion.div
                  key={priority}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: priorityIndex * 0.1 + 0.5 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/20 w-96 flex-shrink-0"
                >
                  {/* Skeleton Header */}
                  <div className="flex justify-between items-center mb-6 p-4 bg-gray-200 rounded-2xl animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <div className="h-6 w-32 bg-gray-300 rounded"></div>
                    </div>
                    <div className="h-6 w-8 bg-gray-300 rounded-full"></div>
                  </div>

                  {/* Skeleton Tasks */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((taskIndex) => (
                      <div key={taskIndex} className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                          <div className="flex space-x-1">
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-800 px-8 py-6 rounded-3xl shadow-xl max-w-md mx-auto text-center"
          >
            <FaExclamationTriangle className="mx-auto text-red-500 text-4xl mb-4" />
            <h3 className="text-2xl font-bold mb-2">Access Denied</h3>
            <p className="mb-6">You don't have permission to access this workspace. You can only access workspaces where you are a member.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/workspace')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Go to My Workspaces
              </button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-800 px-8 py-6 rounded-3xl shadow-xl max-w-md mx-auto text-center"
          >
            <FaExclamationTriangle className="mx-auto text-red-500 text-3xl mb-4" />
            <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-purple-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Debug Info */}
        <div className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-lg text-xs z-50 max-w-xs">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <p>Board ID: {boardId}</p>
          <p>Loading: {loading.toString()}</p>
          <p>Error: {error || 'none'}</p>
          <p>Access Denied: {accessDenied.toString()}</p>
          <p>Board: {board ? 'loaded' : 'null'}</p>
          <p>Tasks: {board?.tasks?.length || 0}</p>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">


          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 space-y-4 sm:space-y-0"
          >
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {board?.name || 'Loading...'}
              </h1>
              {workspace && (
                <p className="text-lg text-gray-600">
                  Workspace: {workspace.name}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">{groupedTasks.high.filter(t => t.status === 'done').length + groupedTasks.medium.filter(t => t.status === 'done').length + groupedTasks.low.filter(t => t.status === 'done').length} Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">{groupedTasks.high.length + groupedTasks.medium.length + groupedTasks.low.length} Total Tasks</span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateTaskOpen(true)}
              disabled={!board}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl ${
                !board
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
              }`}
            >
              <FaPlus className="text-lg" />
              <span>New Task</span>
            </motion.button>
          </motion.div>

          {/* Priority-based Task Groups */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex space-x-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {Object.entries(groupedTasks).map(([priority, tasks], priorityIndex) => (
              <motion.div
                key={priority}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: priorityIndex * 0.1 + 0.5 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/20 w-96 flex-shrink-0 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`flex justify-between items-center mb-6 p-4 rounded-2xl ${getPriorityHeaderColor(priority)} shadow-lg`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <h3 className="text-xl font-bold capitalize">{priority} Priority</h3>
                  </div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">{tasks.length}</span>
                </div>
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"
                    >
                      <FaTasks className="mx-auto text-gray-400 text-3xl mb-3" />
                      <p className="text-gray-500 text-sm">No {priority} priority tasks</p>
                      <p className="text-gray-400 text-xs mt-1">Tasks will appear here</p>
                    </motion.div>
                  ) : (
                    tasks.map((task, taskIndex) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: taskIndex * 0.1 }}
                        onClick={() => openUpdateModal(task)}
                        className="group bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-gray-800 font-semibold text-lg group-hover:text-blue-600 transition-colors">{task.name}</h4>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeColor(task.status || "not-done")}`}>
                            {getStatusLabel(task.status || "not-done")}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                        )}

                        {task.assigned_to && (
                          <div className="mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {task.assigned_to.first_name ? task.assigned_to.first_name.charAt(0).toUpperCase() :
                                 task.assigned_to.username ? task.assigned_to.username.charAt(0).toUpperCase() : '?'}
                              </div>
                              <span className="text-xs text-gray-600 font-medium">
                                {getUserDisplayName(task.assigned_to)}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <FaClock className="w-3 h-3" />
                            <span>{new Date(task.updated_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateTaskStatus(task.id, "not-done");
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                                task.status === "not-done"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600"
                              }`}
                              title="Mark as Not Done"
                            >
                              ✕
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateTaskStatus(task.id, "semi-done");
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                                task.status === "semi-done"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-gray-100 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600"
                              }`}
                              title="Mark as Semi-Done"
                            >
                              ⟳
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateTaskStatus(task.id, "done");
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                                task.status === "done"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600"
                              }`}
                              title="Mark as Done"
                            >
                              <FaCheck />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Create Task Modal */}
        <AnimatePresence>
          {isCreateTaskOpen && (
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
                className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="p-8 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <FaPlus className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">Create New Task</h3>
                  <p className="text-gray-600">Add a new task to your board</p>
                </div>

                {/* Form */}
                <form onSubmit={handleCreateTask} className="px-8 pb-8 space-y-6">
                  <div>
                    <label htmlFor="taskName" className="block text-sm font-semibold text-gray-700 mb-3">
                      Task Name
                    </label>
                    <input
                      type="text"
                      id="taskName"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Enter task name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="taskDescription" className="block text-sm font-semibold text-gray-700 mb-3">
                      Description
                    </label>
                    <textarea
                      id="taskDescription"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
                      rows="3"
                      placeholder="Enter task description"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="taskPriority" className="block text-sm font-semibold text-gray-700 mb-3">
                        Priority
                      </label>
                      <select
                        id="taskPriority"
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="taskStatus" className="block text-sm font-semibold text-gray-700 mb-3">
                        Status
                      </label>
                      <select
                        id="taskStatus"
                        value={newTaskStatus}
                        onChange={(e) => setNewTaskStatus(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      >
                        <option value="not-done">Not Done</option>
                        <option value="semi-done">Semi-Done</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="taskAssignedTo" className="block text-sm font-semibold text-gray-700 mb-3">
                      Assign To
                    </label>
                    <select
                      id="taskAssignedTo"
                      value={newTaskAssignedTo}
                      onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    >
                      <option value="">Unassigned</option>
                      {workspaceMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.first_name && member.last_name
                            ? `${member.first_name} ${member.last_name}`
                            : member.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCreateTaskOpen(false)}
                      className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-medium transition-all duration-300 hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Update Task Modal */}
        <AnimatePresence>
          {isUpdateTaskOpen && (
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
                className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="p-8 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <FaEdit className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">Update Task</h3>
                  <p className="text-gray-600">Edit your task details</p>
                </div>

                {/* Form */}
                <form onSubmit={handleUpdateTask} className="px-8 pb-8 space-y-6">
                  <div>
                    <label htmlFor="updateTaskName" className="block text-sm font-semibold text-gray-700 mb-3">
                      Task Name
                    </label>
                    <input
                      type="text"
                      id="updateTaskName"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Enter task name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="updateTaskDescription" className="block text-sm font-semibold text-gray-700 mb-3">
                      Description
                    </label>
                    <textarea
                      id="updateTaskDescription"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
                      rows="3"
                      placeholder="Enter task description"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="updateTaskPriority" className="block text-sm font-semibold text-gray-700 mb-3">
                        Priority
                      </label>
                      <select
                        id="updateTaskPriority"
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="updateTaskStatus" className="block text-sm font-semibold text-gray-700 mb-3">
                        Status
                      </label>
                      <select
                        id="updateTaskStatus"
                        value={newTaskStatus}
                        onChange={(e) => setNewTaskStatus(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      >
                        <option value="not-done">Not Done</option>
                        <option value="semi-done">Semi-Done</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="updateTaskAssignedTo" className="block text-sm font-semibold text-gray-700 mb-3">
                      Assign To
                    </label>
                    <select
                      id="updateTaskAssignedTo"
                      value={newTaskAssignedTo}
                      onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                    >
                      <option value="">Unassigned</option>
                      {workspaceMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.first_name && member.last_name
                            ? `${member.first_name} ${member.last_name}`
                            : member.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col space-y-3 pt-4">
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsUpdateTaskOpen(false)}
                        className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-medium transition-all duration-300 hover:scale-105"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Update Task
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(selectedTask.id)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <FaTrash />
                      <span>Delete Task</span>
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

export default Board;
