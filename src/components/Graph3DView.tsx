'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Graph, GraphNode } from '@/lib/types';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import EmptyState from './EmptyState';
import { Network, Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface Graph3DViewProps {
  graph: Graph;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  className?: string;
}

interface Node3D extends GraphNode {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  mesh?: THREE.Mesh;
  sprite?: THREE.Sprite;
}

const Graph3DView: React.FC<Graph3DViewProps> = ({
  graph,
  onNodeClick,
  onNodeHover,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodesRef = useRef<Node3D[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const { theme } = useSimpleTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || graph.nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? 0x111827 : 0xf9fafb);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.set(0, 0, 500);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 1.2;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-100, -100, -100);
    scene.add(pointLight);

    // Initialize nodes with 3D positions
    initializeNodes(scene);

    // Create edges
    createEdges(scene);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Update physics
      updatePhysics();

      // Update controls
      controls.update();

      // Render
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Handle mouse move for hover
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      checkHover();
    };
    container.addEventListener('mousemove', handleMouseMove);

    // Handle click
    const handleClick = () => {
      const intersected = getIntersectedNode();
      if (intersected && onNodeClick) {
        onNodeClick(intersected.id);
      }
    };
    container.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      controls.dispose();
      renderer.dispose();

      // Clean up geometries and materials
      scene.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat: THREE.Material) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      container.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, theme]);

  // Initialize nodes with 3D positions
  const initializeNodes = (scene: THREE.Scene) => {
    const nodes: Node3D[] = graph.nodes.map((node, i) => {
      // Spherical distribution
      const phi = Math.acos(-1 + (2 * i) / graph.nodes.length);
      const theta = Math.sqrt(graph.nodes.length * Math.PI) * phi;
      const radius = 300;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      // Create sphere for node
      const geometry = new THREE.SphereGeometry(node.size || 5, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(node.color || '#6366f1'),
        emissive: new THREE.Color(node.color || '#6366f1').multiplyScalar(0.2),
        shininess: 100,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { nodeId: node.id };
      scene.add(mesh);

      // Create label sprite
      const sprite = createTextSprite(node.name, node.color || '#6366f1');
      sprite.position.set(x, y + (node.size || 5) + 10, z);
      scene.add(sprite);

      return {
        ...node,
        x,
        y,
        z,
        vx: 0,
        vy: 0,
        vz: 0,
        mesh,
        sprite,
      };
    });

    nodesRef.current = nodes;
  };

  // Create edges between nodes
  const createEdges = (scene: THREE.Scene) => {
    graph.edges.forEach(edge => {
      const sourceNode = nodesRef.current.find(n => n.id === edge.source);
      const targetNode = nodesRef.current.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        const points = [
          new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z),
          new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z),
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: edge.type === 'tag' ? 0x10b981 : 0x6366f1,
          opacity: 0.3,
          transparent: true,
        });

        const line = new THREE.Line(geometry, material);
        scene.add(line);
      }
    });
  };

  // Create text sprite for labels
  const createTextSprite = (text: string, color: string): THREE.Sprite => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;

    context.font = 'Bold 24px Arial';
    context.fillStyle = color;
    context.textAlign = 'center';
    context.fillText(text.substring(0, 20), 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(50, 12.5, 1);

    return sprite;
  };

  // Simple physics simulation
  const updatePhysics = () => {
    const damping = 0.9;
    const repulsion = 5000;
    const attraction = 0.01;

    // Calculate forces
    nodesRef.current.forEach(node => {
      let fx = 0,
        fy = 0,
        fz = 0;

      // Repulsion from other nodes
      nodesRef.current.forEach(other => {
        if (node.id !== other.id) {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dz = node.z - other.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
          const force = repulsion / (dist * dist);

          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
          fz += (dz / dist) * force;
        }
      });

      // Attraction along edges
      graph.edges.forEach(edge => {
        if (edge.source === node.id) {
          const target = nodesRef.current.find(n => n.id === edge.target);
          if (target) {
            const dx = target.x - node.x;
            const dy = target.y - node.y;
            const dz = target.z - node.z;

            fx += dx * attraction;
            fy += dy * attraction;
            fz += dz * attraction;
          }
        }
        if (edge.target === node.id) {
          const source = nodesRef.current.find(n => n.id === edge.source);
          if (source) {
            const dx = source.x - node.x;
            const dy = source.y - node.y;
            const dz = source.z - node.z;

            fx += dx * attraction;
            fy += dy * attraction;
            fz += dz * attraction;
          }
        }
      });

      // Update velocity
      node.vx = (node.vx + fx) * damping;
      node.vy = (node.vy + fy) * damping;
      node.vz = (node.vz + fz) * damping;

      // Update position
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;

      // Update mesh position
      if (node.mesh) {
        node.mesh.position.set(node.x, node.y, node.z);
      }
      if (node.sprite) {
        node.sprite.position.set(node.x, node.y + (node.size || 5) + 10, node.z);
      }
    });
  };

  // Check for hovered node
  const checkHover = () => {
    const intersected = getIntersectedNode();
    const newHovered = intersected?.id || null;

    if (newHovered !== hoveredNode) {
      setHoveredNode(newHovered);
      if (onNodeHover) {
        onNodeHover(newHovered);
      }

      // Update material
      nodesRef.current.forEach(node => {
        if (node.mesh) {
          const material = node.mesh.material as THREE.MeshPhongMaterial;
          material.emissive = new THREE.Color(node.color || '#6366f1').multiplyScalar(
            node.id === newHovered ? 0.5 : 0.2
          );
        }
      });
    }
  };

  // Get intersected node from raycaster
  const getIntersectedNode = (): Node3D | null => {
    if (!cameraRef.current || !sceneRef.current) return null;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      sceneRef.current.children.filter((obj: THREE.Object3D) => obj instanceof THREE.Mesh)
    );

    if (intersects.length > 0) {
      const nodeId = intersects[0].object.userData.nodeId;
      return nodesRef.current.find(n => n.id === nodeId) || null;
    }

    return null;
  };

  // Control functions
  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 500);
      controlsRef.current.reset();
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.8);
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.25);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (graph.nodes.length === 0) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <EmptyState
          icon={Network}
          title="No Graph Data"
          description="Create notes and link them using [[Note Name]] syntax to build your knowledge graph. The 3D graph will visualize connections between your notes."
          theme={theme}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={resetCamera}
          className="px-3 py-2 text-xs rounded-md shadow-sm transition-colors"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid',
          }}
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={zoomIn}
          className="px-3 py-2 text-xs rounded-md shadow-sm transition-colors"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid',
          }}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={zoomOut}
          className="px-3 py-2 text-xs rounded-md shadow-sm transition-colors"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid',
          }}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="px-3 py-2 text-xs rounded-md shadow-sm transition-colors"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid',
          }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Info overlay */}
      <div
        className="absolute bottom-4 left-4 px-4 py-2 rounded-md text-sm"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-secondary)',
          border: '1px solid',
        }}
      >
        {graph.nodes.length} nodes • {graph.edges.length} edges
        {hoveredNode && (
          <span className="ml-2" style={{ color: 'var(--text-primary)' }}>
            • Hover: {nodesRef.current.find(n => n.id === hoveredNode)?.name}
          </span>
        )}
      </div>

      {/* Instructions */}
      <div
        className="absolute top-4 left-4 px-4 py-3 rounded-md text-xs max-w-xs"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-secondary)',
          border: '1px solid',
        }}
      >
        <div className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          3D Graph Controls
        </div>
        <div className="space-y-1">
          <div>• Click + Drag: Rotate</div>
          <div>• Right Click + Drag: Pan</div>
          <div>• Scroll: Zoom</div>
          <div>• Click Node: Open</div>
        </div>
      </div>
    </div>
  );
};

export default Graph3DView;
