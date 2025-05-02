import React, { useState } from 'react';

const CreateWorkspaceModal = ({ isOpen, onClose, onCreate }) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (workspaceName.trim()) {
      setIsSubmitting(true);
      
      // Call the onCreate function passed from parent component
      onCreate(workspaceName);
      
      // Reset form state
      setWorkspaceName('');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-95 animate-scale-in">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 animate-fade-in">
          Create New Workspace
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 peer"
              placeholder=" "
              required
              autoFocus
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 transform origin-left peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm peer-valid:text-blue-500">
              Workspace Name
            </label>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 font-semibold"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="relative bg-blue-600 text-white px-6 py-2 rounded-lg overflow-hidden group"
              disabled={isSubmitting}
            >
              <span className="relative z-10">
                {isSubmitting ? 'Creating...' : 'Create'}
              </span>
              <span className="absolute inset-0 bg-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
