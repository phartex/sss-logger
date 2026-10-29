import React from 'react';
import ReactDOM from 'react-dom/client';
import { LiveLogViewer } from './LiveLogViewer';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <LiveLogViewer />
  </React.StrictMode>
);
