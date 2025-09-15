// Custom C4 Node Component with proper connection handles
import React, { useState, useRef, useCallback } from 'react';
import { Handle, Position, type NodeProps, NodeResizer } from '@xyflow/react';
import { useDiagramStore, type C4NodeData } from '../stores/diagramStore';

export const C4NodeComponent: React.FC<NodeProps> = ({ 
  data, 
  id, 
  selected,
  width,
  height
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
        relative bg-white rounded-lg shadow-lg border-2 flex flex-col
        ${getNodeTypeColor()}
        ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
        hover:shadow-xl
      `}
      style={{
        width: width || (nodeData.width as number) || 180,
        height: height || (nodeData.height as number) || 120,
        minWidth: '180px',
        minHeight: '120px'
      }}
    >
      {/* React Flow Native Resizer - com handles em todas as direções */}
      {selected && (
        <NodeResizer 
          minWidth={180}
          minHeight={120}
          isVisible={selected}
          lineClassName="border-blue-400 border-2 opacity-80"
          handleClassName="w-3 h-3 bg-blue-400 border border-white rounded-sm opacity-90 hover:opacity-100"
          keepAspectRatio={false}
        />
      )}

      {/* Connection Handles - Otimizados para melhor detecção */}
      {/* Handles Source - Origem das conexões */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full hover:bg-blue-600 hover:scale-110 transition-all duration-200"
        style={{ 
          top: '-8px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          position: 'absolute',
          zIndex: 10
        }}
        isConnectable={true}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full hover:bg-blue-600 hover:scale-110 transition-all duration-200"
        style={{ 
          right: '-8px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          position: 'absolute',
          zIndex: 10
        }}
        isConnectable={true}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full hover:bg-blue-600 hover:scale-110 transition-all duration-200"
        style={{ 
          bottom: '-8px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          position: 'absolute',
          zIndex: 10
        }}
        isConnectable={true}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full hover:bg-blue-600 hover:scale-110 transition-all duration-200"
        style={{ 
          left: '-8px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          position: 'absolute',
          zIndex: 10
        }}
        isConnectable={true}
      />

      {/* Handles Target - Destino das conexões (invisíveis mas ativos) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="w-4 h-4 bg-transparent border-transparent"
        style={{ 
          top: '-8px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          position: 'absolute',
          zIndex: 10
        }}
        isConnectable={true}
      />

      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="w-4 h-4 bg-transparent border-transparent"
        style={{ 
          right: '-8px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          position: 'absolute',
          zIndex: 10
        }}
        isConnectable={true}
      />

      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="w-4 h-4 bg-transparent border-transparent"
        style={{ 
          bottom: '-8px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          position: 'absolute',
          zIndex: 10
        }}
        isConnectable={true}
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="w-4 h-4 bg-transparent border-transparent"
        style={{ 
          left: '-8px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          position: 'absolute',
          zIndex: 10
        }}
        isConnectable={true}
      />

      {/* Node Header */}
      <div className={`px-3 py-2 rounded-t-lg border-b ${getHeaderColor()}`}>
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
            className="font-semibold text-sm text-gray-800 cursor-text hover:bg-gray-100 rounded px-1 py-0.5 transition-colors leading-tight"
          >
            {nodeData.title}
          </div>
        )}
      </div>

      {/* Node Content */}
      <div className="px-3 py-2 flex-1 flex flex-col">
        {isEditing === 'description' ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyDown}
            className="w-full flex-1 bg-white border-2 border-yellow-400 rounded px-2 py-1 text-xs text-gray-600 resize-none focus:outline-none focus:border-yellow-500"
            autoFocus
          />
        ) : (
          <div
            ref={descRef}
            onDoubleClick={() => handleDoubleClick('description')}
            className="text-xs text-gray-600 leading-tight cursor-text whitespace-pre-wrap flex-1 hover:bg-gray-50 rounded px-1 py-0.5 transition-colors overflow-auto"
          >
            {nodeData.description}
          </div>
        )}
      </div>
    </div>
  );
};
