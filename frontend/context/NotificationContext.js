'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationPopup from '../components/ui/NotificationPopup';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState({ show: false, type: '', message: '', title: '' });

    const showNotification = useCallback((type, message, title = '') => {
        setNotification({ show: true, type, message, title });

        // Auto-hide after 3 seconds for simple toasts, keep robust errs/success a bit longer if needed
        // For now, auto-hide all after 3s to keep flow smooth
        if (type !== 'persistent') {
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
        }
    }, []);

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, show: false }));
    };

    // Helper methods
    const showSuccess = (msg, title = 'Success') => showNotification('success', msg, title);
    const showError = (msg, title = 'Error') => showNotification('error', msg, title);
    const showInfo = (msg, title = 'Info') => showNotification('info', msg, title);

    return (
        <NotificationContext.Provider value={{ showSuccess, showError, showInfo, closeNotification }}>
            {children}
            <NotificationPopup
                show={notification.show}
                type={notification.type}
                message={notification.message}
                title={notification.title}
                onClose={closeNotification}
            />
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    return useContext(NotificationContext);
}
