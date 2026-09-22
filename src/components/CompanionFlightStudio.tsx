import React from 'react';
import { DragonTheme, AvatarFlightMode, FlightPatternType } from '../types';
import { Plane, Navigation, Wind, Compass } from 'lucide-react';

interface CompanionFlightStudioProps {
  theme: DragonTheme;
  flightMode: AvatarFlightMode;
  flightPattern: FlightPatternType;
  flightSpeed: number;
  onSetFlightMode: (mode: AvatarFlightMode) => void;
  onSetFlightPattern: (pattern: FlightPatternType) => void;
  onSetFlightSpeed: (speed: number) => void;
}

export function CompanionFlightStudio({
  theme,
  flightMode,
  flightPattern,
  flightSpeed,
  onSetFlightMode,
  onSetFlightPattern,
  onSetFlightSpeed,
}: CompanionFlightStudioProps) {
  return (
    <div className="flex flex-col gap-4 text-slate-100 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-cyan-400" />
          <h3 className="font-orbitron text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            3D Airborne Companion Flight Studio
          </h3>
        </div>
      </div>

      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <button
            onClick={() => onSetFlightMode('docked')}
            className={`p-2.5 rounded-lg border font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              flightMode === 'docked' ? 'bg-cyan-500 text-zinc-950 border-cyan-400' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Pedestal Dock</span>
          </button>
          <button
            onClick={() => onSetFlightMode('flight')}
            className={`p-2.5 rounded-lg border font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              flightMode === 'flight' ? 'bg-cyan-500 text-zinc-950 border-cyan-400' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>Airborne Flight</span>
          </button>
        </div>

        {flightMode === 'flight' && (
          <div className="space-y-3 pt-2 border-t border-zinc-800 text-xs">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1 font-mono">Flight Trajectory Pattern:</label>
              <div className="grid grid-cols-3 gap-1.5 font-mono">
                {(['infinity', 'orbit', 'helix'] as FlightPatternType[]).map((pat) => (
                  <button
                    key={pat}
                    onClick={() => onSetFlightPattern(pat)}
                    className={`py-1.5 rounded border capitalize transition cursor-pointer ${
                      flightPattern === pat ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {pat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-300 font-mono text-[11px]">
                <span>Flight Velocity:</span>
                <span>{flightSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={flightSpeed}
                onChange={(e) => onSetFlightSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
