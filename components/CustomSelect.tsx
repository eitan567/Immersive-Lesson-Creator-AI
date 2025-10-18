import React, { useState, useRef, useEffect } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface CustomSelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options: string[];
  className?: string;
  isEditable?: boolean;
  required?: boolean;
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  name,
  value,
  onChange,
  options,
  className = '',
  isEditable = false,
  required = false,
  placeholder = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if(isEditable) {
      onChange({ target: { name, value: newValue } });
    }
  };

  const handleSelectOption = (option: string) => {
    setInputValue(option);
    onChange({ target: { name, value: option } });
    setIsOpen(false);
  };

  const filteredOptions = isEditable 
    ? options.filter(option => option.toLowerCase().includes(inputValue.toLowerCase()))
    : options;

  return (
    <div className="relative" ref={wrapperRef}>
      {isEditable ? (
        <input
          type="text"
          id={id}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          required={required}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-right text-gray-800 ${className}`}
          onClick={() => setIsOpen(true)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex justify-between items-center text-right ${className}`}
        >
          <span className="text-gray-800">{value || placeholder}</span>
          <ChevronDownIcon className={`h-5 w-5 text-gray-500 transition-transform transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {(isEditable && !filteredOptions.length && inputValue) ? (
             <li className="px-4 py-2 text-gray-500 text-right">אין תוצאות</li>
          ) : (
            filteredOptions.map((option) => (
                <li
                key={option}
                onClick={() => handleSelectOption(option)}
                className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-right text-gray-800"
                >
                {option}
                </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;