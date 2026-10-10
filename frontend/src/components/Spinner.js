import React from 'react';

export default function Spinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-wrapper">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}
