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
    const [footerYear, setFooterYear] = useState('2025');

    const updateFooterYear = (newYear) => {
        setFooterYear(newYear);
    };

    return (
        <FooterContext.Provider value={{ footerYear, updateFooterYear }}>
            {children}
        </FooterContext.Provider>
    );
};
