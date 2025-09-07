import React, { useState, useEffect } from 'react';
import './EmailTestView.css';

const EmailTestView = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [announcementType, setAnnouncementType] = useState('requirements_reminder');
  const [testResults, setTestResults] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Test data for request approval
  const [requestType, setRequestType] = useState('Transcript of Records');
  const [requestStatus, setRequestStatus] = useState('approved');
  const [requestNotes, setRequestNotes] = useState('Your document is ready for pick-up');

  useEffect(() => {
    fetchStudentsWithEmails();
    testEmailConnection();
  }, []);

  const fetchStudentsWithEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email-test/students-with-emails');
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.students);
      } else {
        console.error('Failed to fetch students:', data.message);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const testEmailConnection = async () => {
    try {
      const response = await fetch('/api/email-test/test-connection');
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus({ success: false, message: 'Connection test failed' });
    }
  };

  const testAnnouncementEmail = async () => {
    if (!selectedStudent || !message.trim()) {
      alert('Please select a student and enter a message');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/email-test/test-announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          message: message,
          type: announcementType
        })
      });

      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Error testing announcement email:', error);
      setTestResults({ success: false, message: 'Test failed' });
    } finally {
      setLoading(false);
    }
  };

  const testRequestApprovalEmail = async () => {
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/email-test/test-request-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          requestType: requestType,
          status: requestStatus,
          notes: requestNotes
        })
      });

      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Error testing request approval email:', error);
      setTestResults({ success: false, message: 'Test failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-test-container">
      <div className="email-test-header">
        <h2>📧 Email Notification Testing</h2>
        <p>Test email notifications for announcements and request approvals</p>
      </div>

      {/* Connection Status */}
      <div className="connection-status">
        <h3>Connection Status</h3>
        {connectionStatus ? (
          <div className={`status-indicator ${connectionStatus.success ? 'success' : 'error'}`}>
            <span className="status-icon">
              {connectionStatus.success ? '✅' : '❌'}
            </span>
            <span className="status-text">
              {connectionStatus.message}
            </span>
          </div>
        ) : (
          <div className="status-indicator loading">
            <span className="status-icon">⏳</span>
            <span className="status-text">Testing connection...</span>
          </div>
        )}
        <button 
          className="test-connection-btn"
          onClick={testEmailConnection}
          disabled={loading}
        >
          Test Connection
        </button>
      </div>

      {/* Student Selection */}
      <div className="student-selection">
        <h3>Select Student</h3>
        <select 
          value={selectedStudent} 
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="student-select"
        >
          <option value="">Select a student...</option>
          {students.map(student => (
            <option key={student.userId} value={student.userId}>
              {student.fullName} ({student.email})
            </option>
          ))}
        </select>
        <button 
          className="refresh-btn"
          onClick={fetchStudentsWithEmails}
          disabled={loading}
        >
          Refresh Students
        </button>
      </div>

      {/* Test Announcement Email */}
      <div className="test-section">
        <h3>Test Announcement Email</h3>
        <div className="form-group">
          <label>Announcement Type:</label>
          <select 
            value={announcementType} 
            onChange={(e) => setAnnouncementType(e.target.value)}
            className="type-select"
          >
            <option value="requirements_reminder">Requirements Reminder</option>
            <option value="general">General Announcement</option>
          </select>
        </div>
        <div className="form-group">
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter announcement message..."
            className="message-textarea"
            rows="4"
          />
        </div>
        <button 
          className="test-btn announcement"
          onClick={testAnnouncementEmail}
          disabled={loading || !selectedStudent || !message.trim()}
        >
          {loading ? 'Sending...' : 'Test Announcement Email'}
        </button>
      </div>

      {/* Test Request Approval Email */}
      <div className="test-section">
        <h3>Test Request Approval Email</h3>
        <div className="form-group">
          <label>Request Type:</label>
          <input
            type="text"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Status:</label>
          <select 
            value={requestStatus} 
            onChange={(e) => setRequestStatus(e.target.value)}
            className="status-select"
          >
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="ready for pick-up">Ready for Pick-up</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="form-group">
          <label>Notes:</label>
          <textarea
            value={requestNotes}
            onChange={(e) => setRequestNotes(e.target.value)}
            placeholder="Enter additional notes..."
            className="notes-textarea"
            rows="3"
          />
        </div>
        <button 
          className="test-btn request"
          onClick={testRequestApprovalEmail}
          disabled={loading || !selectedStudent}
        >
          {loading ? 'Sending...' : 'Test Request Approval Email'}
        </button>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="test-results">
          <h3>Test Results</h3>
          <div className={`result-indicator ${testResults.success ? 'success' : 'error'}`}>
            <span className="result-icon">
              {testResults.success ? '✅' : '❌'}
            </span>
            <div className="result-content">
              <p className="result-message">{testResults.message}</p>
              {testResults.emailSent !== undefined && (
                <p className="email-status">
                  Email Sent: {testResults.emailSent ? 'Yes' : 'No'}
                </p>
              )}
              <p className="result-timestamp">
                {new Date(testResults.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="instructions">
        <h3>Instructions</h3>
        <ol>
          <li>Make sure email configuration is set up in your environment variables</li>
          <li>Test the email connection first</li>
          <li>Select a student with a valid email address</li>
          <li>Test both announcement and request approval emails</li>
          <li>Check the student's email inbox (and spam folder) for the test emails</li>
        </ol>
      </div>
    </div>
  );
};

export default EmailTestView;
