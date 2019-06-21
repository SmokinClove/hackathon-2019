import React from 'react';
import Components from './Components';
import Draw from './Draw';
import './App.css';

function App() {
  const canvas = new Components();
  canvas.addRect(100, 100, 500, 150);
  return (
    <div className="App"><Draw /></div>
  );
}

export default App;
