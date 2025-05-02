import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const Board = () => {
  // Get board ID from URL
  const { id } = useParams();

  // Mock data for board (replace with API data in production)
  const [board, setBoard] = useState({
    id: parseInt(id),
    name: `Board ${id}`,
    lists: [
      {
        id: 1,
        name: 'To Do',
        tasks: [
          { id: 1, name: 'Design homepage' },
          { id: 2, name: 'Write documentation' },
        ],
      },
      {
        id: 2,
        name: 'In Progress',
        tasks: [{ id: 3, name: 'Develop API' }],
      },
      {
        id: 3,
        name: 'Done',
        tasks: [{ id: 4, name: 'Test login feature' }],
      },
    ],
  });

  // State for create task modal
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [animateContent, setAnimateContent] = useState(false);

  // Trigger entrance animations on mount
  useEffect(() => {
    setTimeout(() => setAnimateContent(true), 100);
  }, []);

  // Handle creating a new task
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      // In production, send API request to create task
      setBoard({
        ...board,
        lists: board.lists.map((list) =>
          list.id === 1 // Add to first list (To Do) for demo
            ? {
                ...list,
                tasks: [
                  ...list.tasks,
                  { id: list.tasks.length + 1, name: newTaskName },
                ],
              }
            : list
        ),
      });
      setNewTaskName('');
      setIsCreateTaskOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-blue-100 pt-16 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="#3B82F6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 animate-slide-down">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4 sm:mb-0">
            {board.name}
          </h2>
          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="relative bg-blue-600 text-white px-6 py-3 rounded-full font-semibold overflow-hidden group"
          >
            <span className="relative z-10">Create Task</span>
            <span className="absolute inset-0 bg-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </button>
        </div>

        {/* Lists and Tasks */}
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {board.lists.map((list, listIndex) => (
            <div
              key={list.id}
              className={`bg-gray-50 p-4 rounded-2xl shadow-md w-80 flex-shrink-0 transition-all duration-500 ${
                animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${listIndex * 100}ms` }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{list.name}</h3>
              <div className="space-y-3">
                {list.tasks.length === 0 ? (
                  <p className="text-gray-600 text-sm">No tasks yet.</p>
                ) : (
                  list.tasks.map((task, taskIndex) => (
                    <div
                      key={task.id}
                      className={`bg-white p-3 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-fade-in`}
                      style={{ animationDelay: `${(listIndex * 100 + taskIndex * 50)}ms` }}
                    >
                      <p className="text-gray-700">{task.name}</p>
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
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-95 animate-scale-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 animate-fade-in">
              Create New Task
            </h3>
            <form onSubmit={handleCreateTask}>
              <div className="relative mb-6">
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 peer"
                  placeholder=" "
                  required
                  autoFocus
                />
                <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 transform origin-left peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm peer-valid:text-blue-500">
                  Task Name
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskOpen(false)}
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
  );
};

export default Board;