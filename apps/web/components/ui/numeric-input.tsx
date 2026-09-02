import React, { ForwardedRef, forwardRef, useEffect, useState } from 'react';
import { Input } from './input';

// Helper to format string/number with commas
export const formatNumberWithCommas = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  const stringValue = value.toString();
  
  const parts = stringValue.split('.');
  let integerPart = parts[0].replace(/[^\d-]/g, '');
  
  if (integerPart) {
    const isNegative = integerPart.startsWith('-');
    if (isNegative) integerPart = integerPart.slice(1);
    
    // Add commas
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    if (isNegative) integerPart = '-' + integerPart;
  }
  
  if (parts.length > 1) {
    const decimalPart = parts[1].replace(/[^\d]/g, '');
    return `${integerPart}.${decimalPart}`;
  }
  
  return integerPart;
};

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

export const NumericInput = forwardRef(
  ({ value, onChange, ...props }: NumericInputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const [localValue, setLocalValue] = useState<string>('');

    // Sync with external value changes
    useEffect(() => {
      const cleanLocal = localValue.replace(/,/g, '');
      const parsedLocal = parseFloat(cleanLocal);
      
      // Check if we need to sync from external value (e.g. form reset or pre-population)
      if (isNaN(parsedLocal) || parsedLocal !== value) {
        setLocalValue(value === 0 ? '' : formatNumberWithCommas(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Keep only valid characters (digits, minus, dot, comma)
      let cleaned = inputValue.replace(/[^\d.,-]/g, '');
      
      // Handle decimal point
      const dotIndex = cleaned.indexOf('.');
      if (dotIndex !== -1) {
        cleaned = cleaned.slice(0, dotIndex + 1) + cleaned.slice(dotIndex + 1).replace(/\./g, '');
      }

      const formatted = formatNumberWithCommas(cleaned);
      setLocalValue(formatted);

      // Parse clean string and notify parent
      const cleanValue = formatted.replace(/,/g, '');
      if (!cleanValue || cleanValue === '-' || cleanValue === '.') {
        onChange(0);
      } else {
        const parsed = parseFloat(cleanValue);
        onChange(isNaN(parsed) ? 0 : parsed);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={localValue}
        onChange={handleChange}
      />
    );
  }
);

NumericInput.displayName = 'NumericInput';
