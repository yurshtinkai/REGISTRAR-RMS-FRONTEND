import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';
import './NotificationBell.css';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null); // To detect clicks outside
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { 'X-Session-Token': sessionManager.getSessionToken() }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/notifications/read`, {
        method: 'PATCH',
        headers: { 'X-Session-Token': sessionManager.getSessionToken() },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Close the dropdown
    setIsOpen(false);
    
    // Mark this specific notification as read
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, {
        method: 'PATCH',
        headers: { 'X-Session-Token': sessionManager.getSessionToken() },
      });
      
      if (response.ok) {
        // Refresh notifications to update the count
        fetchNotifications();
      } else {
        console.error('Failed to mark notification as read:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
    
    // Check notification message content to determine navigation
    const message = notification.message.toLowerCase();
    
    if (message.includes('request') || message.includes('grade slip') || message.includes('transcript') || message.includes('payment')) {
      // Navigate to My Request page for request-related notifications
      navigate('/student/my-request');
    } else if (message.includes('enrollment') || message.includes('announcement')) {
      // Navigate to home page for enrollment/announcement notifications
      navigate('/student/home');
    } else {
      // Default to home page
      navigate('/student/home');
    }
  };

  return (
    <div className="notification-bell" ref={bellRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="btn btn-link text-white position-relative">
        <i className="fa-solid fa-bell fa-lg"></i>
        {unreadCount > 0 && <span className="badge bg-danger notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span className="header-title">Notifications</span>
            <div className="header-icons">
              <i
                className="fa-solid fa-check text-primary"
                title="Mark all as read"
                onClick={handleMarkAsRead}
              ></i>
              <i
                className="fa-solid fa-gear text-primary"
                title="Settings"
                onClick={() => console.log('Open settings')}
              ></i>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.isRead ? 'unread' : 'read'}`}
                  onClick={() => handleNotificationClick(notif)}
                  style={{ cursor: 'pointer' }}
                >
                  <p className={notif.isRead ? 'read-notification' : ''}>{notif.message}</p>
                  <small>{new Date(notif.createdAt).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-muted">No notifications yet.</div>
            )}
          </div>

          <div className="notification-footer">
            <a 
              href="/student/home" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/student/home');
                setIsOpen(false);
              }}
            >
              See all
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
