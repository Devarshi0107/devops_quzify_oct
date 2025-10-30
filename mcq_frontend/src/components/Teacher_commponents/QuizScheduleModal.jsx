

import React, { useState } from 'react';
import moment from 'moment-timezone';

const API = import.meta.env.VITE_BACKEND_API_URL;
const QuizScheduleModal = ({ onClose, quizId }) => {
  const today = new Date().toISOString().split('T')[0];
  const [scheduleDate, setScheduleDate] = useState('2025-03-20');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatTimeFor12Hour = (time24h) => {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTimeRangeString = () => {
    return `${formatTimeFor12Hour(startTime)} - ${formatTimeFor12Hour(endTime)}`;
  };


  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
  
    try {
      // Combine date and times with IST timezone
      const startMoment = moment.tz(`${scheduleDate}T${startTime}`, "Asia/Kolkata");
      const endMoment = moment.tz(`${scheduleDate}T${endTime}`, "Asia/Kolkata");
  
      // Prepare update data with proper ISO format
      const updateData = {
        schedule_date: scheduleDate,
        schedule_time_range: {
          start: startMoment.format("YYYY-MM-DDTHH:mm:ss.SSS+05:30"),
          end: endMoment.format("YYYY-MM-DDTHH:mm:ss.SSS+05:30")
        }
      };
  
      const response = await fetch(
        // `http://localhost:3001/api/quiz/updatequiz/${quizId}`
        `${API}/api/quiz/updatequiz/${quizId}`
        
        ,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateData),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to update quiz");
      }
  
      onClose(); 
    } catch (err) {
      setError(err.message || 'Failed to update quiz schedule. Please try again.');
      console.error('Error updating quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-4">
          <h2 className="text-2xl font-bold text-white">Update Quiz Schedule</h2>
        </div>
        
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white hover:text-gray-200"
        >
          ✕
        </button>
        
        {/* Form content */}
        <div className="p-6 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Schedule Date</label>
            <input
              type="date"
              min={today}
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Footer with action buttons */}
        <div className="p-4 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizScheduleModal;
