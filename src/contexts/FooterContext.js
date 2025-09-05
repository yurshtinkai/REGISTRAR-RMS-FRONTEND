import React, { createContext, useContext, useState } from 'react';

const FooterContext = createContext();

export const useFooter = () => {
    const context = useContext(FooterContext);
    if (!context) {
        throw new Error('useFooter must be used within a FooterProvider');
    }
    return context;
};

export const FooterProvider = ({ children }) => {
    const [footerYear, setFooterYear] = useState(() => {
        // Initialize from localStorage or default to '2025'
        return localStorage.getItem('footerYear') || '2025';
    });

    const updateFooterYear = (newYear) => {
        setFooterYear(newYear);
        // Persist to localStorage
        localStorage.setItem('footerYear', newYear);
    };

    return (
        <FooterContext.Provider value={{ footerYear, updateFooterYear }}>
            {children}
        </FooterContext.Provider>
    );
};
