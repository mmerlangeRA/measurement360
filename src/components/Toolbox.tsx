// src/components/Toolbox.tsx
import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';

export enum toolNames {
    'measure' = 'measure'
}

export interface Tool {
    id: toolNames;
    IconComponent: React.ElementType;
    toolTip: string;
}

interface ToolboxProps {
    tools: Tool[]
    selectedTool: Tool | null,
    setSelectedTool: (_: Tool | null) => void;
}

const toolboxStyles = {
    position: 'absolute',
    top: 10,
    right: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    background: 'rgba(255, 255, 255, 0.8)',
    padding: 2,
    borderRadius: 1,
    boxShadow: 3,
    zIndex: 2
};

const Toolbox: React.FC<ToolboxProps> = ({ tools, selectedTool, setSelectedTool }) => {
    return (
        <Box component="div" sx={toolboxStyles}>
            {tools.map((tool) => (
                <Tooltip key={tool.id} title={tool.toolTip}>
                    <IconButton
                        color={tool.id === selectedTool?.id ? "secondary" : "primary"}
                        onClick={() => setSelectedTool(tool.id === selectedTool?.id ? null : tool)}
                    >
                        <tool.IconComponent />
                    </IconButton>
                </Tooltip>
            ))}
        </Box>
    );
};

export default Toolbox;
