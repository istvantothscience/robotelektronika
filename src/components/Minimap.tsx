import React, { useEffect, useState } from 'react';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  playerAngle: number;
}

export const Minimap: React.FC<MinimapProps> = ({ playerX, playerZ, playerAngle }) => {
  // Minimap bounds: world extends from x: -30..30, z: -30..30
  // Map size: 130px diameter
  const mapRadius = 56;
  const worldScale = 1.6; // pixels per world meter

  // Key POIs
  const pois = [
    { id: 'lab', label: 'Static Lab', x: 0, z: -18, color: '#8b5cf6' },
    { id: 'junkyard', label: 'Junkyard', x: -10, z: 8, color: '#f43f5e' },
    { id: 'pod', label: 'Awakening Pod', x: 0, z: 13, color: '#22d3ee' },
    { id: 'tower', label: 'Central Tower', x: 0, z: -26, color: '#ffb52e' },
  ];

  return (
    <div className="relative w-32 h-32 rounded-full bg-slate-950/85 backdrop-blur-md border-2 border-cyan-500/50 shadow-2xl overflow-hidden flex items-center justify-center">
      {/* Outer Compass Ring & Markings */}
      <div className="absolute inset-0 rounded-full border border-cyan-400/20" />
      <div className="absolute top-1 text-[10px] font-bold text-cyan-400 font-mono">N</div>
      <div className="absolute bottom-1 text-[9px] font-bold text-slate-500 font-mono">S</div>
      <div className="absolute left-1.5 text-[9px] font-bold text-slate-500 font-mono">W</div>
      <div className="absolute right-1.5 text-[9px] font-bold text-slate-500 font-mono">E</div>

      {/* Grid rings */}
      <div className="absolute w-20 h-20 rounded-full border border-cyan-500/15" />
      <div className="absolute w-10 h-10 rounded-full border border-cyan-500/15" />
      <div className="absolute w-full h-[1px] bg-cyan-500/15" />
      <div className="absolute h-full w-[1px] bg-cyan-500/15" />

      {/* POI Markers */}
      {pois.map((poi) => {
        // Calculate relative position to player
        const dx = (poi.x - playerX) * worldScale;
        const dz = (poi.z - playerZ) * worldScale;

        // Clamp inside circle
        const dist = Math.sqrt(dx * dx + dz * dz);
        const clampedDist = Math.min(dist, mapRadius - 8);
        const angle = Math.atan2(dz, dx);
        const cx = Math.cos(angle) * clampedDist;
        const cy = Math.sin(angle) * clampedDist;

        return (
          <div
            key={poi.id}
            title={poi.label}
            className="absolute w-2 h-2 rounded-full border border-white/80 shadow-sm"
            style={{
              backgroundColor: poi.color,
              transform: `translate(${cx}px, ${cy}px)`,
              boxShadow: `0 0 6px ${poi.color}`,
            }}
          />
        );
      })}

      {/* Center: Player Arrow indicating heading */}
      <div
        className="relative z-10 w-4 h-4 flex items-center justify-center transition-transform duration-75"
        style={{
          transform: `rotate(${playerAngle + Math.PI}rad)`,
        }}
      >
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-cyan-400 filter drop-shadow-[0_0_4px_#22d3ee]" />
      </div>

      {/* Subtle radar sweep line */}
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgba(34,211,238,0.15)_0deg,transparent_60deg)] animate-spin-slow pointer-events-none" />
    </div>
  );
};
