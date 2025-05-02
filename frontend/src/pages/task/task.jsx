import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskApp = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'low',
    board: 1 // Adjust based on your Django board ID
  });
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch tasks from Django API
  useEffect(() => {
    axios.get('http://localhost:8000/api/tasks/')
      .then(response => setTasks(response.data))
      .catch(error => console.error('Error fetching tasks:', error));
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Create or update task
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      // Update task
      axios.put(`http://localhost:8000/api/tasks/${editingTask.id}/`, formData)
        .then(response => {
          setTasks(tasks.map(task => task.id === editingTask.id ? response.data : task));
          resetForm();
        })
        .catch(error => console.error('Error updating task:', error));
    } else {
      // Create task
      axios.post('http://localhost:8000/api/tasks/', formData)
        .then(response => {
          setTasks([...tasks, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error creating task:', error));
    }
  };

  // Delete task
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      axios.delete(`http://localhost:8000/api/tasks/${id}/`)
        .then(() => {
          setTasks(tasks.filter(task => task.id !== id));
        })
        .catch(error => console.error('Error deleting task:', error));
    }
  };

  // Edit task
  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description,
      priority: task.priority,
      board: task.board
    });
    setIsModalOpen(true);
  };

  // Reset form and close modal
  const resetForm = () => {
    setFormData({ name: '', description: '', priority: 'low', board: 1 });
    setEditingTask(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Task Management</h1>

        {/* Create Task Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add New Task
        </button>

        {/* Task List */}
        <div className="grid gap-4">
          {tasks.map(task => (
            <div
              key={task.id}
              className="bg-white p-4 rounded-lg shadow-md flex justify-between items-start"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{task.name}</h3>
                <p className="text-gray-600">{task.description}</p>
                <p className="text-sm text-gray-500">
                  Priority: <span className={`font-medium ${task.priority === 'high' ? 'text-red-600' : task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(task.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Updated: {new Date(task.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Create/Edit Task */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingTask ? 'Edit Task' : 'Create Task'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700">Task Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                    maxLength="200"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingTask ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskApp;