// Custom C4 Node Component with proper connection handles
import React, { useState, useRef, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useDiagramStore, type C4NodeData } from '../stores/diagramStore';

export const C4NodeComponent: React.FC<NodeProps> = ({ 
  data, 
  id, 
  selected 
}) => {
  const [isEditing, setIsEditing] = useState<'title' | 'description' | null>(null);
  const [editValue, setEditValue] = useState('');
  const { updateNodeData } = useDiagramStore();
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  const nodeData = data as C4NodeData;

  const handleDoubleClick = useCallback((field: 'title' | 'description') => {
    setIsEditing(field);
    setEditValue(nodeData[field]);
  }, [nodeData]);

  const handleEditSubmit = useCallback(() => {
    if (isEditing && typeof id === 'string') {
      updateNodeData(id, { [isEditing]: editValue });
      setIsEditing(null);
    }
  }, [isEditing, editValue, id, updateNodeData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(null);
    }
  }, [handleEditSubmit]);

  const getNodeTypeColor = () => {
    switch (nodeData.type) {
      case 'person': return 'bg-green-50 border-green-300';
      case 'system': return 'bg-blue-50 border-blue-300';
      case 'container': return 'bg-purple-50 border-purple-300';
      case 'component': return 'bg-yellow-50 border-yellow-300';
      default: return 'bg-gray-50 border-gray-300';
    }
  };

  const getHeaderColor = () => {
    switch (nodeData.type) {
      case 'person': return 'bg-green-100 border-green-200';
      case 'system': return 'bg-blue-100 border-blue-200';
      case 'container': return 'bg-purple-100 border-purple-200';
      case 'component': return 'bg-yellow-100 border-yellow-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div 
      className={`
        relative min-w-[180px] max-w-[300px] bg-white rounded-lg shadow-lg border-2 transition-all duration-200
        ${getNodeTypeColor()}
        ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
        hover:shadow-xl
      `}
    >
      {/* Connection Handles - Visible and properly positioned */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full !-top-1.5 !left-1/2 !transform !-translate-x-1/2 hover:bg-blue-600 hover:scale-125 transition-all"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full !-top-1.5 !left-1/2 !transform !-translate-x-1/2 hover:bg-blue-600 hover:scale-125 transition-all"
      />

      <Handle
        type="target"
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full !-right-1.5 !top-1/2 !transform !-translate-y-1/2 hover:bg-blue-600 hover:scale-125 transition-all"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full !-right-1.5 !top-1/2 !transform !-translate-y-1/2 hover:bg-blue-600 hover:scale-125 transition-all"
      />

      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full !-bottom-1.5 !left-1/2 !transform !-translate-x-1/2 hover:bg-blue-600 hover:scale-125 transition-all"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full !-bottom-1.5 !left-1/2 !transform !-translate-x-1/2 hover:bg-blue-600 hover:scale-125 transition-all"
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full !-left-1.5 !top-1/2 !transform !-translate-y-1/2 hover:bg-blue-600 hover:scale-125 transition-all"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full !-left-1.5 !top-1/2 !transform !-translate-y-1/2 hover:bg-blue-600 hover:scale-125 transition-all"
      />

      {/* Node Header */}
      <div className={`px-4 py-3 rounded-t-lg border-b ${getHeaderColor()}`}>
        {isEditing === 'title' ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyDown}
            className="w-full bg-white border-2 border-yellow-400 rounded px-2 py-1 text-sm font-semibold text-gray-800 focus:outline-none focus:border-yellow-500"
            autoFocus
          />
        ) : (
          <div
            ref={titleRef}
            onDoubleClick={() => handleDoubleClick('title')}
            className="font-semibold text-sm text-gray-800 cursor-text hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
          >
            {nodeData.title}
          </div>
        )}
      </div>

      {/* Node Content */}
      <div className="px-4 py-3">
        {isEditing === 'description' ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyDown}
            className="w-full h-20 bg-white border-2 border-yellow-400 rounded px-2 py-1 text-sm text-gray-600 resize-none focus:outline-none focus:border-yellow-500"
            autoFocus
          />
        ) : (
          <div
            ref={descRef}
            onDoubleClick={() => handleDoubleClick('description')}
            className="text-sm text-gray-600 leading-relaxed cursor-text whitespace-pre-wrap min-h-[50px] hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
          >
            {nodeData.description}
          </div>
        )}
      </div>

      {/* Type indicator */}
      <div className="absolute -top-2 -right-2 px-2 py-1 text-xs font-semibold rounded-full shadow-sm bg-white border">
        {nodeData.type.charAt(0).toUpperCase()}
      </div>
    </div>
  );
};
