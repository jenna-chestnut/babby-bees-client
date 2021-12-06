import React from 'react';
import './AlertBanner.css';

const AlertBanner = (props) => {
  const { message, type, setAlert } = props;
  return (
    <div className={`alert-banner ${type}`}>
      {message || 'ALERT!'}
      <button onClick={() => setAlert({active: null})}>&#10005;</button>
    </div>
  );
};

export default AlertBanner;