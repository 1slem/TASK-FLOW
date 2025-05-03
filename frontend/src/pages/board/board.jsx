import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";

const Board = () => {
  const { id: workspaceId } = useParams(); // This is the workspace ID from the URL
  const [boards, setBoards] = useState([]); // Store all boards
  const [selectedBoardId, setSelectedBoardId] = useState(null); // Track which board is selected
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isUpdateTaskOpen, setIsUpdateTaskOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [selectedTask, setSelectedTask] = useState(null);
  const [animateContent, setAnimateContent] = useState(false);

  // Get the currently selected board
  const selectedBoard = boards.find(board => board.id === selectedBoardId) || 
                       (boards.length > 0 ? boards[0] : { id: null, name: "", tasks: [] });

  // Group tasks by priority for the SELECTED board only
  const groupedTasks = {
    high: selectedBoard.tasks ? selectedBoard.tasks.filter(task => task.priority === "high") : [],
    medium: selectedBoard.tasks ? selectedBoard.tasks.filter(task => task.priority === "medium") : [],
    low: selectedBoard.tasks ? selectedBoard.tasks.filter(task => task.priority === "low") : []
  };

  // Fetch boards and their tasks for the workspace
  useEffect(() => {
    const fetchBoardsData = async () => {
      setLoading(true);
      try {
        // Fetch all boards for this workspace
        const response = await axios.get(`http://localhost:8000/board/all/${workspaceId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Process the response to ensure each board has its own tasks
        const boardsData = response.data;
        setBoards(boardsData);
        
        // Set the first board as selected by default
        if (boardsData.length > 0 && !selectedBoardId) {
          setSelectedBoardId(boardsData[0].id);
        }
        
        setLoading(false);
        setTimeout(() => setAnimateContent(true), 100);
      } catch (err) {
        console.error("Error fetching boards data:", err);
        setError("Failed to load boards data. Please try again later.");
        setLoading(false);
      }
    };

    fetchBoardsData();
  }, [workspaceId]);

  // Create a new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedBoardId) {
      alert("No board selected. Please select a board first.");
      return;
    }
    
    if (newTaskName.trim()) {
      try {
        const response = await axios.post(`http://localhost:8000/task/create/${selectedBoardId}`, {
          name: newTaskName,
          description: newTaskDescription,
          priority: newTaskPriority
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Add the new task to the correct board only
        const newTask = response.data.task;
        
        setBoards(prevBoards => 
          prevBoards.map(board => 
            board.id === selectedBoardId 
              ? { ...board, tasks: [...board.tasks, newTask] }
              : board
          )
        );
        
        // Reset form
        setNewTaskName("");
        setNewTaskDescription("");
        setNewTaskPriority("medium");
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
    if (!selectedBoardId || !selectedTask) {
      alert("No board or task selected.");
      return;
    }
    
    if (newTaskName.trim()) {
      try {
        const response = await axios.put(
          `http://localhost:8000/task/update/${selectedBoardId}/t/${selectedTask.id}`, 
          {
            name: newTaskName,
            description: newTaskDescription,
            priority: newTaskPriority
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        // Update the task in the correct board only
        const updatedTask = response.data;
        
        setBoards(prevBoards => 
          prevBoards.map(board => 
            board.id === selectedBoardId 
              ? { 
                  ...board, 
                  tasks: board.tasks.map(task => 
                    task.id === selectedTask.id ? updatedTask : task
                  ) 
                }
              : board
          )
        );
        
        // Reset form
        setNewTaskName("");
        setNewTaskDescription("");
        setNewTaskPriority("medium");
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
    if (!selectedBoardId) {
      alert("No board selected.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`http://localhost:8000/task/delete/${selectedBoardId}/t/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Remove the task from the correct board only
        setBoards(prevBoards => 
          prevBoards.map(board => 
            board.id === selectedBoardId 
              ? { ...board, tasks: board.tasks.filter(task => task.id !== taskId) }
              : board
          )
        );
        
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

  // Handle board selection
  const handleBoardSelect = (boardId) => {
    setSelectedBoardId(boardId);
  };

  // Open the update modal for a task
  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setNewTaskName(task.name);
    setNewTaskDescription(task.description || "");
    setNewTaskPriority(task.priority);
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Board Selection */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 mr-4">Select Board:</h3>
              <div className="flex space-x-2 overflow-x-auto">
                {boards.map(board => (
                  <button
                    key={board.id}
                    onClick={() => handleBoardSelect(board.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedBoardId === board.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {board.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                {selectedBoard.name}
              </h2>
              {selectedBoard.workspace && (
                <p className="text-sm text-gray-500">
                  Workspace: {selectedBoard.workspace.name}
                </p>
              )}
            </div>
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              disabled={!selectedBoardId}
              className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
                !selectedBoardId ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              + New Task
            </button>
          </div>

          {/* Priority-based Task Groups */}
          <div className="flex space-x-4 overflow-x-auto pb-4 pl-20 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {Object.entries(groupedTasks).map(([priority, tasks], priorityIndex) => (
              <div
                key={priority}
                className={`bg-white p-4 rounded-lg shadow-sm w-85 flex-shrink-0 transition-all duration-500 ${
                  animateContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${priorityIndex * 100}ms` }}
              >
                <div className={`flex justify-between items-center mb-4 p-2 rounded-lg ${getPriorityHeaderColor(priority)}`}>
                  <h3 className="text-lg font-semibold capitalize">{priority} Priority</h3>
                  <span className="text-sm">{tasks.length} tasks</span>
                </div>
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No tasks with {priority} priority</p>
                  ) : (
                    tasks.map((task, taskIndex) => (
                      <div
                        key={task.id}
                        onClick={() => openUpdateModal(task)}
                        className={`bg-gray-50 p-3 rounded-md border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer ${
                          animateContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        }`}
                        style={{ transitionDelay: `${priorityIndex * 100 + taskIndex * 50}ms` }}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-gray-700 font-medium">{task.name}</p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Updated {new Date(task.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Task Modal */}
        {isCreateTaskOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h3>
              <form onSubmit={handleCreateTask}>
                <div className="mb-4">
                  <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name
                  </label>
                  <input
                    type="text"
                    id="taskName"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="taskDescription"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="taskPriority"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateTaskOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Update Task Modal */}
        {isUpdateTaskOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Update Task</h3>
              <form onSubmit={handleUpdateTask}>
                <div className="mb-4">
                  <label htmlFor="updateTaskName" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name
                  </label>
                  <input
                    type="text"
                    id="updateTaskName"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="updateTaskDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="updateTaskDescription"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="updateTaskPriority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="updateTaskPriority"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsUpdateTaskOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Board;
