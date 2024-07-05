// src/App.tsx
import React, { useState } from 'react';
import './App.css';
import Sphere360App from './components/ManagedSphere360';
import Toolbox, { Tool, toolNames } from './components/Toolbox';
import StraightenIcon from '@mui/icons-material/Straighten';

const tools: Tool[] = [{ id: toolNames.measure, IconComponent: StraightenIcon, toolTip: 'Select Points and Draw Line' }];

const App: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);


  return (
    <div className="App" style={{ width: '100%', height: '100%' }}>
      <Toolbox tools={tools} selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
      <Sphere360App imagePath="/images/D_P1_CAM_G_2_EAC.png" selectedToolName={selectedTool?.id || ''} />
    </div>
  );
};

export default App;
