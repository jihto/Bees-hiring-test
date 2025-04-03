import React from "react";

interface FormFieldProps {
    label: string;
    type?: "text" | "email" | "password" | "number";
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    min?: string;
    max?: string;
    step?: string;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
    className = "",
    disabled = false,
    min="", 
    max="",
    step=""
}) => {
    return (
        <div className="flex flex-col space-y-1">
            <label className="dark:text-white text-gray-700 font-medium">{label}</label> 
            <input
                min={min}
                max={max}
                step={step}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={` ${className} ${disabled && "opacity-20"} text-black dark:text-white p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={disabled}
            /> 
        </div>
    );
};

export default FormField;
