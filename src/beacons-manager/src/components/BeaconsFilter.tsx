'use client';

import { useState } from 'react';

interface FilterProps {
  onFilter: (filters: { nivel?: string; codSensor?: string }) => void;
  onClear: () => void;
}

export default function BeaconsFilter({ onFilter, onClear }: FilterProps) {
  const [nivel, setNivel] = useState('');
  const [codSensor, setCodSensor] = useState('');

  const handleFilter = () => {
    const filters: { nivel?: string; codSensor?: string } = {};
    
    if (nivel.trim()) {
      filters.nivel = nivel.trim();
    }
    
    if (codSensor.trim()) {
      filters.codSensor = codSensor.trim();
    }
    
    onFilter(filters);
  };

  const handleClear = () => {
    setNivel('');
    setCodSensor('');
    onClear();
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
            Nivel
          </label>
          <input
            id="nivel"
            type="number"
            className="input"
            placeholder="Filtrar por nivel"
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="codSensor" className="block text-sm font-medium text-gray-700 mb-1">
            Código Sensor
          </label>
          <input
            id="codSensor"
            type="text"
            className="input"
            placeholder="Filtrar por código"
            value={codSensor}
            onChange={(e) => setCodSensor(e.target.value)}
          />
        </div>
        
        <div className="flex items-end space-x-2">
          <button
            onClick={handleFilter}
            className="btn btn-primary flex-1"
          >
            Filtrar
          </button>
          <button
            onClick={handleClear}
            className="btn btn-secondary flex-1"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
