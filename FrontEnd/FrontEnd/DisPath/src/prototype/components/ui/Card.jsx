import React from 'react';

export const Card = ({
    children,
    className = '',
    hover = false,
    onClick,
    ...props
}) => {
    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-gray-100 ${
                hover ? 'hover:shadow-md transition-shadow duration-200' : ''
            } ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

