import React from 'react';

export default function Message({ type = 'info', children }) {
  return (
    <div className={`message message-${type}`} role="alert">
      {children}
    </div>
  );
}
