const DeleteConfirmationDialog = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-[999]">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start mb-5">
            <div className="bg-red-100 rounded-full p-2 mr-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-red-500"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-normal text-gray-800">Delete Exam</h3>
            </div>
          </div>
          
          <p className="text-gray-700 mb-8 pl-14">
            Are you sure you want to delete this exam? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-2">
            <button
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-medium"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;