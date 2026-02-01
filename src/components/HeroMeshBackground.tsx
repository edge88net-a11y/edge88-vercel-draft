import { useEffect, useRef } from 'react';

export function HeroMeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Resize canvas to match parent
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Grid configuration
    const gridSize = 60;
    const nodeRadius = 1.5;
    const lineOpacity = 0.08;
    const nodeOpacity = 0.12;
    const connectionDistance = 120;

    // Floating nodes
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseX: number;
      baseY: number;
    }

    const nodes: Node[] = [];

    // Create grid nodes with slight randomness
    const initNodes = () => {
      nodes.length = 0;
      const cols = Math.ceil(canvas.width / gridSize) + 2;
      const rows = Math.ceil(canvas.height / gridSize) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * gridSize - gridSize;
          const baseY = j * gridSize - gridSize;
          nodes.push({
            x: baseX,
            y: baseY,
            baseX,
            baseY,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
          });
        }
      }
    };

    initNodes();
    window.addEventListener('resize', initNodes);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.005;

      // Update node positions with gentle floating motion
      nodes.forEach((node) => {
        node.x = node.baseX + Math.sin(time + node.baseX * 0.01) * 8;
        node.y = node.baseY + Math.cos(time + node.baseY * 0.01) * 8;
      });

      // Draw connections between nearby nodes
      ctx.strokeStyle = `hsla(217, 91%, 60%, ${lineOpacity})`;
      ctx.lineWidth = 0.5;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * lineOpacity;
            ctx.strokeStyle = `hsla(217, 91%, 60%, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[j].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw grid lines (subtle)
      ctx.strokeStyle = `hsla(217, 60%, 50%, 0.04)`;
      ctx.lineWidth = 0.5;

      // Horizontal lines
      const rows = Math.ceil(canvas.height / gridSize) + 1;
      for (let i = 0; i < rows; i++) {
        const y = (i * gridSize + time * 10) % canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Vertical lines
      const cols = Math.ceil(canvas.width / gridSize) + 1;
      for (let i = 0; i < cols; i++) {
        const x = i * gridSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw nodes
      nodes.forEach((node) => {
        // Only draw nodes that are visible
        if (node.x >= -10 && node.x <= canvas.width + 10 && 
            node.y >= -10 && node.y <= canvas.height + 10) {
          
          // Radial fade - nodes near center are more visible
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const distFromCenter = Math.sqrt(
            Math.pow(node.x - centerX, 2) + Math.pow(node.y - centerY, 2)
          );
          const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
          const fade = 1 - (distFromCenter / maxDist) * 0.5;

          ctx.fillStyle = `hsla(217, 91%, 60%, ${nodeOpacity * fade})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw subtle radial gradient overlay for depth
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.3, 0,
        canvas.width / 2, canvas.height * 0.3, canvas.width * 0.8
      );
      gradient.addColorStop(0, 'hsla(217, 91%, 60%, 0.03)');
      gradient.addColorStop(0.5, 'hsla(217, 91%, 50%, 0.01)');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', initNodes);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
