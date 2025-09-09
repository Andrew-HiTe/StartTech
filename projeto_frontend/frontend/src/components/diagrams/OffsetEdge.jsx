

const OFFSET = 10; // pixels para deslocar levemente para a direita

export default function OffsetEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }) {
  let sx = sourceX;
  let sy = sourceY;
  let tx = targetX;
  let ty = targetY;

  // Desloca apenas se a conexão for top/bottom
  if (sourcePosition === 'top' || sourcePosition === 'bottom') {
    sx += OFFSET;
  }
  if (targetPosition === 'top' || targetPosition === 'bottom') {
    tx += OFFSET;
  }

  // Caminho ortogonal (cotovelo/90°)
  let edgePath = '';
  // Se a conexão é vertical (top/bottom)
  if ((sourcePosition === 'top' || sourcePosition === 'bottom') && (targetPosition === 'top' || targetPosition === 'bottom')) {
    const midY = sy + (ty - sy) / 2;
    edgePath = `M${sx},${sy} L${sx},${midY} L${tx},${midY} L${tx},${ty}`;
  } else if ((sourcePosition === 'left' || sourcePosition === 'right') && (targetPosition === 'left' || targetPosition === 'right')) {
    // Se a conexão é horizontal (left/right)
    const midX = sx + (tx - sx) / 2;
    edgePath = `M${sx},${sy} L${midX},${sy} L${midX},${ty} L${tx},${ty}`;
  } else {
    // Caso misto (ex: left para top, etc): faz um cotovelo simples
    edgePath = `M${sx},${sy} L${sx},${ty} L${tx},${ty}`;
  }

  return (
    <path
      id={id}
      style={{ ...style, strokeDasharray: '4 4', stroke: '#64748b', strokeWidth: 2, fill: 'none' }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
}
