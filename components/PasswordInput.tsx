'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  wrapperStyle?: React.CSSProperties;
};

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  function PasswordInput({ wrapperStyle, style, ...props }, ref) {
    const [show, setShow] = useState(false);

    return (
      <div style={{ position: 'relative', ...wrapperStyle }}>
        <input
          {...props}
          ref={ref}
          type={show ? 'text' : 'password'}
          style={{ paddingRight: 40, ...style }}
        />
        <button
          type="button"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow((v) => !v)}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  },
);
