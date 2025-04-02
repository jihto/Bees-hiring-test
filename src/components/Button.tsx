import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    ...rest
}) => {
    const variantStyles = () => {
        switch (variant) {
            case 'primary':
                return 'bg-blue-600 hover:bg-blue-700 text-white';
            case 'secondary':
                return 'bg-red-600 hover:bg-red-700 text-white';
            case 'outline':
                return 'border border-blue-600 text-blue-600 hover:bg-blue-50';
            default:
                return 'bg-blue-600 hover:bg-blue-700 text-white';
        }
    };

    const sizeStyles = () => {
        switch (size) {
            case 'small':
                return 'px-3 py-1 text-sm';
            case 'medium':
                return 'px-4 py-2 text-base';
            case 'large':
                return 'px-5 py-3 text-lg';
            default:
                return 'px-4 py-2 text-base';
        }
    };

    const fullWidthStyles = fullWidth ? 'w-full' : '';

    return (
        <button
            {...rest}
            className={`
                rounded-md font-semibold transition-colors duration-200 
                ${variantStyles()} 
                ${sizeStyles()} 
                ${fullWidthStyles}
                ${rest.disabled ? "opacity-40" : ""}
            `}
        >
            {children}
        </button>
    );
};

export default Button;