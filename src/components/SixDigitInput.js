import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";

const SixDigitInput = ({ onComplete }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  useEffect(() => {
    inputs.current[0].focus();
  }, []);

  const handleChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value !== '' && index < 5) {
        inputs.current[index + 1].focus();
      }

      if (newCode.every(digit => digit !== '')) {
        onComplete(newCode.join(''));
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && code[index] === '') {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex justify-between max-w-xs mx-auto">
      {code.map((digit, index) => (
        <Input
          key={index}
          ref={el => inputs.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          className="w-12 h-12 text-center text-lg font-bold"
        />
      ))}
    </div>
  );
};

export default SixDigitInput;