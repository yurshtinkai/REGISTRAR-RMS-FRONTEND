import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';

function SettingsPage() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);

    // Fetch settings on component mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/settings`, {
                headers: {
                    'X-Session-Token': sessionManager.getSessionToken()
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSettings(data.data || []);
            } else {
                console.error('Failed to fetch settings');
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (setting) => {
        setEditingKey(setting.key);
        setEditValue(setting.value);
    };

    const handleSave = async (key) => {
        try {
            setSaving(true);
            const response = await fetch(`${API_BASE_URL}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionManager.getSessionToken()
                },
                body: JSON.stringify({
                    key: key,
                    value: editValue
                })
            });

            if (response.ok) {
                // Update local state
                setSettings(prev => prev.map(setting => 
                    setting.key === key 
                        ? { ...setting, value: editValue }
                        : setting
                ));
                setEditingKey(null);
                setEditValue('');
                
                // Show success message
                alert('✅ Setting updated successfully!');
            } else {
                const error = await response.json();
                alert(`❌ Failed to update setting: ${error.message}`);
            }
        } catch (error) {
            console.error('Error updating setting:', error);
            alert('❌ Error updating setting. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingKey(null);
        setEditValue('');
    };

    const getSettingDisplayName = (key) => {
        const displayNames = {
            'login_title': 'Login Form Title',
            'login_subtitle': 'Login Form Subtitle',
            'system_name': 'System Name',
            'institution_name': 'Institution Name'
        };
        return displayNames[key] || key.replace(/_/g, ' ').toUpperCase();
    };

    const getSettingDescription = (setting) => {
        return setting.description || 'No description available';
    };

    const getCategoryColor = (category) => {
        const colors = {
            'ui': 'primary',
            'general': 'secondary',
            'security': 'warning',
            'notification': 'info'
        };
        return colors[category] || 'secondary';
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>⚙️ System Settings</h2>
                <div className="text-muted">
                    <small>Configure system-wide settings and preferences</small>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="fas fa-cogs me-2"></i>
                                Application Settings
                            </h5>
                        </div>
                        <div className="card-body">
                            {settings.length === 0 ? (
                                <div className="text-center text-muted py-5">
                                    <h5>No settings found</h5>
                                    <p>System settings will appear here when available.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Setting</th>
                                                <th>Current Value</th>
                                                <th>Description</th>
                                                <th>Category</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {settings.map((setting) => (
                                                <tr key={setting.key}>
                                                    <td>
                                                        <strong>{getSettingDisplayName(setting.key)}</strong>
                                                        <br />
                                                        <small className="text-muted">{setting.key}</small>
                                                    </td>
                                                    <td>
                                                        {editingKey === setting.key ? (
                                                            <div className="input-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    placeholder="Enter new value..."
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="d-flex align-items-center">
                                                                <code className="bg-light p-2 rounded">
                                                                    {setting.value}
                                                                </code>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {getSettingDescription(setting)}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <span className={`badge bg-${getCategoryColor(setting.category)}`}>
                                                            {setting.category}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {editingKey === setting.key ? (
                                                            <div className="btn-group btn-group-sm">
                                                                <button
                                                                    className="btn btn-success"
                                                                    onClick={() => handleSave(setting.key)}
                                                                    disabled={saving}
                                                                >
                                                                    {saving ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                                                            Saving...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-check me-1"></i>
                                                                            Save
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    onClick={handleCancel}
                                                                    disabled={saving}
                                                                >
                                                                    <i className="fas fa-times me-1"></i>
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={() => handleEdit(setting)}
                                                            >
                                                                <i className="fas fa-edit me-1"></i>
                                                                Edit
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0">
                                <i className="fas fa-eye me-2"></i>
                                Login Form Preview
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row justify-content-center">
                                <div className="col-md-6">
                                    <div className="card border-2 border-primary">
                                        <div className="card-body text-center">
                                            <h3 className="mb-3">
                                                {settings.find(s => s.key === 'login_title')?.value || '🔐 Welcome Back'}
                                            </h3>
                                            <p className="text-muted mb-4">
                                                {settings.find(s => s.key === 'login_subtitle')?.value || 'Sign in to your account with your ID and password'}
                                            </p>
                                            <div className="mb-3">
                                                <input type="text" className="form-control" placeholder="ID Number" disabled />
                                            </div>
                                            <div className="mb-3">
                                                <input type="password" className="form-control" placeholder="Password" disabled />
                                            </div>
                                            <button className="btn btn-primary w-100" disabled>
                                                Login as Administrator
                                            </button>
                                            <div className="mt-3">
                                                <small className="text-muted">
                                                    This is a preview of how the login form will appear
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
