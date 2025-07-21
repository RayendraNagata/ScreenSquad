import React from 'react';

const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error = false,
  errorMessage = '',
  label = '',
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-gray-900' : '';

  const classes = `
    ${baseClasses}
    ${errorClasses}
    ${disabledClasses}
    ${className}
  `.trim();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        className={classes}
        {...props}
      />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-400">{errorMessage}</p>
      )}
    </div>
  );
};

export default Input;
