import React from 'react';

const FormInput = ({ type, placeholder, value, onChange, error }) => (
    <div className="mb-4 w-full">
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 bg-[#eee] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4B2B] transition duration-200 text-sm ${error ? 'border border-red-500' : ''
                }`}
            required
        />
        {error && (
            <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
    </div>
);

export default FormInput;
