import React, { useRef, useEffect } from 'react';
import './NotificationDropdown.css';

const NotificationDropdown = ({ notifications, onClose }) => {
    const dropdownRef = useRef();

    // Log notifications khi component render
    console.log("NotificationDropdown rendered with notifications:", notifications);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div className="notification-dropdown" ref={dropdownRef}>
            <div className="dropdown-header">Thông báo</div>
            {notifications.length === 0 ? (
                <div className="dropdown-empty">Không có thông báo mới</div>
            ) : (
                <ul className="dropdown-list">
                    {notifications.slice(0, 10).map((n, idx) => {
                        console.log("Rendering notification:", n); // Log từng notification
                        return (
                            <li key={n._id || idx} className={`dropdown-item ${n.type === 'goal_achieved' ? 'success' : ''}`}>
                                <div className="item-message">{n.content}</div>
                                <div className="item-time">{n.createdAt || ''}</div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default NotificationDropdown; 