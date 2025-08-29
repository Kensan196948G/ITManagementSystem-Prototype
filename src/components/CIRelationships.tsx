import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Filter, Eye, EyeOff } from 'lucide-react';

interface CINode {
  id: string;
  name: string;
  type: 'server' | 'network' | 'database' | 'application' | 'storage' | 'security';
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number; // fixed position
  fy?: number;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  details: {
    description: string;
    owner: string;
    lastUpdated: string;
    dependencies: number;
  };
}

interface CIRelationship {
  source: string;
  target: string;
  type: 'depends_on' | 'connects_to' | 'manages' | 'monitors' | 'supports';
  strength: number; // 1-3
}

const CI_TYPES = {
  server: { color: '#3B82F6', shape: 'rect', label: 'サーバー' },
  network: { color: '#10B981', shape: 'diamond', label: 'ネットワーク' },
  database: { color: '#F59E0B', shape: 'cylinder', label: 'データベース' },
  application: { color: '#8B5CF6', shape: 'hexagon', label: 'アプリケーション' },
  storage: { color: '#EF4444', shape: 'rect', label: 'ストレージ' },
  security: { color: '#6B7280', shape: 'shield', label: 'セキュリティ'  }
};

const RELATIONSHIP_TYPES = {
  depends_on: { color: '#EF4444', label: '依存関係', dash: [5, 5] },
  connects_to: { color: '#3B82F6', label: '接続', dash: [] },
  manages: { color: '#10B981', label: '管理', dash: [10, 5] },
  monitors: { color: '#F59E0B', label: '監視', dash: [2, 3] },
  supports: { color: '#8B5CF6', label: 'サポート', dash: [15, 5, 5, 5] }
};

const STATUS_COLORS = {
  healthy: '#10B981',
  warning: '#F59E0B',
  critical: '#EF4444',
  offline: '#6B7280'
};

const CIRelationships: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<CINode | null>(null);
  const [selectedNode, setSelectedNode] = useState<CINode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<CINode | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [showMinimap, setShowMinimap] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRelationType, setFilterRelationType] = useState<string>('all');
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Sample data
  const initialNodes: CINode[] = useMemo(() => [
    { id: '1', name: 'Webサーバー01', type: 'server', x: Math.random() * 400, y: Math.random() * 300, vx: 0, vy: 0, status: 'healthy',
      details: { description: 'メインWebサーバー', owner: '運用チーム', lastUpdated: '2025-08-28', dependencies: 5 }},
    { id: '2', name: 'DBサーバー01', type: 'database', x: Math.random() * 400, y: Math.random() * 300, vx: 0, vy: 0, status: 'healthy',
      details: { description: 'プライマリデータベース', owner: 'DBチーム', lastUpdated: '2025-08-27', dependencies: 8 }},
    { id: '3', name: 'ロードバランサー', type: 'network', x: Math.random() * 400, y: Math.random() * 300, vx: 0, vy: 0, status: 'warning',
      details: { description: 'トラフィック分散装置', owner: 'ネットワークチーム', lastUpdated: '2025-08-28', dependencies: 3 }},
    { id: '4', name: 'ERP システム', type: 'application', x: Math.random() * 400, y: Math.random() * 300, vx: 0, vy: 0, status: 'healthy',
      details: { description: '基幹業務システム', owner: 'アプリチーム', lastUpdated: '2025-08-25', dependencies: 12 }},
    { id: '5', name: 'ファイアウォール', type: 'security', x: Math.random() * 400, y: Math.random() * 300, vx: 0, vy: 0, status: 'healthy',
      details: { description: 'ネットワークセキュリティ', owner: 'セキュリティチーム', lastUpdated: '2025-08-28', dependencies: 2 }},
    { id: '6', name: 'NASストレージ', type: 'storage', x: Math.random() * 400, y: Math.random() * 300, vx: 0, vy: 0, status: 'critical',
      details: { description: '共有ストレージ', owner: 'ストレージチーム', lastUpdated: '2025-08-26', dependencies: 15 }},
    { id: '7', name: 'APIサーバー', type: 'server', x: Math.random() * 400, y: Math.random() * 300, vx: 0, vy: 0, status: 'healthy',
      details: { description: 'REST APIサーバー', owner: '開発チーム', lastUpdated: '2025-08-28', dependencies: 4 }},
    { id: '8', name: '監視システム', type: 'application', x: Math.random() * 400, y: Math.random() * 300, vx: 0, vy: 0, status: 'healthy',
      details: { description: 'システム監視ツール', owner: '運用チーム', lastUpdated: '2025-08-28', dependencies: 7 }}
  ], []);

  const relationships: CIRelationship[] = useMemo(() => [
    { source: '1', target: '2', type: 'depends_on', strength: 3 },
    { source: '3', target: '1', type: 'connects_to', strength: 2 },
    { source: '4', target: '2', type: 'depends_on', strength: 3 },
    { source: '5', target: '3', type: 'manages', strength: 1 },
    { source: '6', target: '1', type: 'supports', strength: 2 },
    { source: '7', target: '2', type: 'depends_on', strength: 2 },
    { source: '8', target: '1', type: 'monitors', strength: 1 },
    { source: '8', target: '2', type: 'monitors', strength: 1 },
    { source: '8', target: '7', type: 'monitors', strength: 1 },
    { source: '4', target: '7', type: 'connects_to', strength: 2 }
  ], []);

  const [nodes, setNodes] = useState<CINode[]>(initialNodes);

  // Filter nodes and relationships based on current filters
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => filterType === 'all' || node.type === filterType);
  }, [nodes, filterType]);

  const filteredRelationships = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return relationships.filter(rel => 
      nodeIds.has(rel.source) && 
      nodeIds.has(rel.target) &&
      (filterRelationType === 'all' || rel.type === filterRelationType)
    );
  }, [filteredNodes, relationships, filterRelationType]);

  // Force simulation
  const updateForces = useCallback(() => {
    const alpha = 0.3;
    const centerForce = 0.01;
    const repulsionForce = 1000;
    const linkForce = 0.5;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    setNodes(currentNodes => {
      const newNodes = [...currentNodes];
      
      // Reset forces
      newNodes.forEach(node => {
        if (node.fx === undefined) {
          node.vx *= 0.99; // damping
          node.vy *= 0.99;
        }
      });

      // Center force
      newNodes.forEach(node => {
        if (node.fx === undefined) {
          const dx = centerX - node.x;
          const dy = centerY - node.y;
          node.vx += dx * centerForce;
          node.vy += dy * centerForce;
        }
      });

      // Repulsion force between nodes
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const nodeA = newNodes[i];
          const nodeB = newNodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsionForce / (distance * distance);
          
          if (nodeA.fx === undefined) {
            nodeA.vx -= (dx / distance) * force;
            nodeA.vy -= (dy / distance) * force;
          }
          if (nodeB.fx === undefined) {
            nodeB.vx += (dx / distance) * force;
            nodeB.vy += (dy / distance) * force;
          }
        }
      }

      // Link force
      filteredRelationships.forEach(link => {
        const sourceNode = newNodes.find(n => n.id === link.source);
        const targetNode = newNodes.find(n => n.id === link.target);
        
        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDistance = 80 + link.strength * 20;
          const force = (distance - targetDistance) * linkForce;
          
          if (sourceNode.fx === undefined) {
            sourceNode.vx += (dx / distance) * force;
            sourceNode.vy += (dy / distance) * force;
          }
          if (targetNode.fx === undefined) {
            targetNode.vx -= (dx / distance) * force;
            targetNode.vy -= (dy / distance) * force;
          }
        }
      });

      // Update positions
      newNodes.forEach(node => {
        if (node.fx !== undefined) {
          node.x = node.fx;
          node.y = node.fy;
        } else {
          node.x += node.vx * alpha;
          node.y += node.vy * alpha;
          
          // Boundary constraints
          const margin = 30;
          node.x = Math.max(margin, Math.min(dimensions.width - margin, node.x));
          node.y = Math.max(margin, Math.min(dimensions.height - margin, node.y));
        }
      });

      return newNodes;
    });
  }, [dimensions, filteredRelationships]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updateForces();
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateForces]);

  // Drawing functions
  const drawNode = (ctx: CanvasRenderingContext2D, node: CINode) => {
    const config = CI_TYPES[node.type];
    const size = selectedNode?.id === node.id ? 25 : 20;
    const isHovered = hoveredNode?.id === node.id;
    
    ctx.save();
    ctx.translate(node.x, node.y);
    
    // Glow effect for selected/hovered nodes
    if (selectedNode?.id === node.id || isHovered) {
      ctx.shadowColor = config.color;
      ctx.shadowBlur = 15;
    }
    
    // Draw node based on shape
    ctx.fillStyle = config.color;
    ctx.strokeStyle = STATUS_COLORS[node.status];
    ctx.lineWidth = 3;
    
    switch (config.shape) {
      case 'rect':
        ctx.fillRect(-size/2, -size/2, size, size);
        ctx.strokeRect(-size/2, -size/2, size, size);
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(size/2, 0);
        ctx.lineTo(0, size/2);
        ctx.lineTo(-size/2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case 'cylinder':
        const cylinderHeight = size;
        const cylinderRadius = size/3;
        // Top ellipse
        ctx.beginPath();
        ctx.ellipse(0, -cylinderHeight/2, cylinderRadius, cylinderRadius/3, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        // Body
        ctx.fillRect(-cylinderRadius, -cylinderHeight/2, cylinderRadius*2, cylinderHeight);
        ctx.strokeRect(-cylinderRadius, -cylinderHeight/2, cylinderRadius*2, cylinderHeight);
        // Bottom ellipse
        ctx.beginPath();
        ctx.ellipse(0, cylinderHeight/2, cylinderRadius, cylinderRadius/3, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      case 'hexagon':
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = Math.cos(angle) * size/2;
          const y = Math.sin(angle) * size/2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case 'shield':
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(size/3, -size/4);
        ctx.lineTo(size/3, size/4);
        ctx.lineTo(0, size/2);
        ctx.lineTo(-size/3, size/4);
        ctx.lineTo(-size/3, -size/4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      default:
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    
    // Status indicator
    ctx.fillStyle = STATUS_COLORS[node.status];
    ctx.beginPath();
    ctx.arc(size/2 - 5, -size/2 + 5, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
    
    // Label
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(node.name, node.x, node.y + size + 15);
  };

  const drawRelationship = (ctx: CanvasRenderingContext2D, relationship: CIRelationship) => {
    const sourceNode = filteredNodes.find(n => n.id === relationship.source);
    const targetNode = filteredNodes.find(n => n.id === relationship.target);
    
    if (!sourceNode || !targetNode) return;
    
    const config = RELATIONSHIP_TYPES[relationship.type];
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return;
    
    const unitX = dx / length;
    const unitY = dy / length;
    const offset = 25;
    
    const startX = sourceNode.x + unitX * offset;
    const startY = sourceNode.y + unitY * offset;
    const endX = targetNode.x - unitX * offset;
    const endY = targetNode.y - unitY * offset;
    
    // Draw line
    ctx.strokeStyle = config.color;
    ctx.lineWidth = relationship.strength;
    ctx.setLineDash(config.dash);
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw arrow
    const arrowSize = 8;
    const arrowAngle = Math.PI / 6;
    
    ctx.setLineDash([]);
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(Math.atan2(dy, dx) - arrowAngle),
      endY - arrowSize * Math.sin(Math.atan2(dy, dx) - arrowAngle)
    );
    ctx.lineTo(
      endX - arrowSize * Math.cos(Math.atan2(dy, dx) + arrowAngle),
      endY - arrowSize * Math.sin(Math.atan2(dy, dx) + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
  };

  const drawMinimap = (ctx: CanvasRenderingContext2D) => {
    if (!showMinimap) return;
    
    const minimapSize = 150;
    const minimapX = dimensions.width - minimapSize - 10;
    const minimapY = 10;
    const scaleX = minimapSize / dimensions.width;
    const scaleY = minimapSize / dimensions.height;
    
    // Minimap background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1;
    ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Draw nodes in minimap
    filteredNodes.forEach(node => {
      ctx.fillStyle = CI_TYPES[node.type].color;
      ctx.beginPath();
      ctx.arc(
        minimapX + node.x * scaleX,
        minimapY + node.y * scaleY,
        2,
        0, 2 * Math.PI
      );
      ctx.fill();
    });
    
    // Draw viewport rectangle
    const viewportX = minimapX - transform.x * scaleX / transform.scale;
    const viewportY = minimapY - transform.y * scaleY / transform.scale;
    const viewportW = minimapSize / transform.scale;
    const viewportH = minimapSize / transform.scale;
    
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportW, viewportH);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transform
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);
    
    // Draw relationships first (behind nodes)
    filteredRelationships.forEach(relationship => {
      drawRelationship(ctx, relationship);
    });
    
    // Draw nodes
    filteredNodes.forEach(node => {
      drawNode(ctx, node);
    });
    
    ctx.restore();
    
    // Draw UI elements (not transformed)
    drawMinimap(ctx);
  }, [filteredNodes, filteredRelationships, transform, selectedNode, hoveredNode, showMinimap, dimensions]);

  // Mouse event handlers
  const getMousePos = (e: React.MouseEvent): { x: number, y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - transform.x) / transform.scale,
      y: (e.clientY - rect.top - transform.y) / transform.scale
    };
  };

  const getNodeAtPosition = (x: number, y: number): CINode | null => {
    return filteredNodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= 25;
    }) || null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const node = getNodeAtPosition(pos.x, pos.y);
    
    if (node) {
      setIsDragging(true);
      setDragNode(node);
      setSelectedNode(node);
      
      // Fix node position for dragging
      setNodes(current => 
        current.map(n => 
          n.id === node.id ? { ...n, fx: n.x, fy: n.y } : n
        )
      );
    } else {
      setSelectedNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    
    if (isDragging && dragNode) {
      setNodes(current => 
        current.map(n => 
          n.id === dragNode.id ? { ...n, fx: pos.x, fy: pos.y, x: pos.x, y: pos.y } : n
        )
      );
    } else {
      const hoveredNode = getNodeAtPosition(pos.x, pos.y);
      setHoveredNode(hoveredNode);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragNode) {
      // Release fixed position
      setNodes(current => 
        current.map(n => 
          n.id === dragNode.id ? { ...n, fx: undefined, fy: undefined } : n
        )
      );
    }
    
    setIsDragging(false);
    setDragNode(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.max(0.1, Math.min(3, transform.scale + delta));
    
    setTransform(prev => ({
      ...prev,
      scale: newScale
    }));
  };

  // Control functions
  const zoomIn = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(3, prev.scale * 1.2)
    }));
  };

  const zoomOut = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, prev.scale / 1.2)
    }));
  };

  const resetLayout = () => {
    setNodes(current => 
      current.map(node => ({
        ...node,
        x: Math.random() * (dimensions.width - 100) + 50,
        y: Math.random() * (dimensions.height - 100) + 50,
        vx: 0,
        vy: 0,
        fx: undefined,
        fy: undefined
      }))
    );
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  // Resize handler
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width - 20, height: height - 100 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
    }
  }, [dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-50 relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="bg-white rounded-lg shadow p-2 flex gap-2">
          <button
            onClick={zoomIn}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="ズームイン"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="ズームアウト"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={resetLayout}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            title="レイアウトリセット"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            title="ミニマップ表示切替"
          >
            {showMinimap ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-2 flex gap-2 items-center">
          <Filter size={16} className="text-gray-600" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border-0 bg-transparent focus:ring-0"
          >
            <option value="all">全てのCI</option>
            {Object.entries(CI_TYPES).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={filterRelationType}
            onChange={(e) => setFilterRelationType(e.target.value)}
            className="text-sm border-0 bg-transparent focus:ring-0"
          >
            <option value="all">全ての関係</option>
            {Object.entries(RELATIONSHIP_TYPES).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: CI_TYPES[selectedNode.type].color }}
            />
            <h3 className="font-semibold text-lg">{selectedNode.name}</h3>
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[selectedNode.status] }}
            />
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">タイプ:</span> {CI_TYPES[selectedNode.type].label}</p>
            <p><span className="font-medium">説明:</span> {selectedNode.details.description}</p>
            <p><span className="font-medium">担当者:</span> {selectedNode.details.owner}</p>
            <p><span className="font-medium">更新日:</span> {selectedNode.details.lastUpdated}</p>
            <p><span className="font-medium">依存関係数:</span> {selectedNode.details.dependencies}</p>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-white rounded-lg shadow p-3">
        <h4 className="font-semibold text-sm mb-2">凡例</h4>
        <div className="space-y-1 text-xs">
          {Object.entries(CI_TYPES).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: config.color }}
              />
              <span>{config.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 text-xs">
          <h5 className="font-semibold">ステータス</h5>
          {Object.entries(STATUS_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>
                {key === 'healthy' ? '正常' :
                 key === 'warning' ? '警告' :
                 key === 'critical' ? '重要' : 'オフライン'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CIRelationships;