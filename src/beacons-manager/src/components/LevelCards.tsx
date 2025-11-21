'use client';

import { useState, useEffect } from 'react';
import { InfoBeacon, Area } from '@/types';
import NotificationContainer, { useNotifications } from '@/components/NotificationContainer';

interface LevelCardProps {
  area: Area;
  beaconCount: number;
  beacons: InfoBeacon[];
  onSelect: (areaId: string) => void;
  isSelected: boolean;
  onToggleActive: (areaId: string, activo: boolean, areaData: Area) => Promise<void> | void;
  isSaving: boolean;
}

function LevelCard({ area, beaconCount, beacons, onSelect, isSelected, onToggleActive, isSaving }: LevelCardProps) {
  const getAreaColor = (color: string) => {
    return `bg-[${color}]`;
  };

  const downloadJSON = () => {
    console.log('🔍 Debug downloadJSON:', {
      area: area,
      beacons: beacons,
      areaXataId: area.xata_id
    });
    
    // Filtrar beacons por área usando xata_id
    const levelBeacons = beacons.filter(beacon => beacon.areaId === area.xata_id);
    
    console.log('🔍 Filtered beacons:', levelBeacons);
    
    // Crear el objeto JSON con el formato requerido
    const jsonData: Record<string, { x: number; y: number; z: number }> = {};
    
    levelBeacons.forEach((beacon, index) => {
      // Usar idenSensor como clave, o generar s1, s2, etc. si no hay idenSensor
      const key = beacon.idenSensor || `s${index + 1}`;
      
      jsonData[key] = {
        x: beacon.x || 0,
        y: beacon.y || 0,
        z: beacon.z || 1.65
      };
    });

    console.log('🔍 JSON Data:', jsonData);

    const jsonString = JSON.stringify(jsonData, null, 2);
    
    // Crear blob y descargar
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${area.codigo}_beacons.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={() => onSelect(area.xata_id!)}
      className={`relative cursor-pointer transition-all duration-200 transform hover:scale-105 ${
        isSelected 
          ? 'shadow-xl' 
          : 'hover:shadow-lg'
      }`}
    >
      <div className={`bg-gray-800 rounded-lg shadow-md overflow-hidden ${area.activo ? 'border-2 border-green-500' : 'border border-gray-700'}`}>
        {/* Header con color del nivel */}
        <div className={`h-2`} style={{ backgroundColor: area.color }}></div>
        
        {/* Contenido principal */}
        <div className="p-4">
          {/* Título y código */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-white">{area.codigo}</h3>
              <p className="text-sm text-gray-300">{area.nombre}</p>
              <p className="text-xs text-gray-400">{area.ubicacion}</p>
            </div>
            
            {/* Indicadores de estado */}
            <div className="flex flex-col items-end space-y-1">
              {area.activo && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-green-100">
                  Listo
                </span>
              )}
              {isSelected && (
                <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          {/* Información de sensores */}
          <div className="text-center mb-3">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white`} style={{ backgroundColor: area.color }}>
              {beaconCount} sensor{beaconCount !== 1 ? 'es' : ''}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {beaconCount === 0 ? 'Sin sensores registrados' : 'Sensores registrados'}
            </p>
          </div>
        </div>
        
        {/* Footer con acciones */}
        <div className="px-4 py-3 bg-gray-700 border-t border-gray-600">
          {/* Estado activo/inactivo */}
          <div className="flex justify-center mb-2">
            <label
              className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                className="h-3 w-3 text-green-600 rounded border-gray-600 bg-gray-800 focus:ring-green-500 focus:ring-1"
                checked={!!area.activo}
                disabled={isSaving}
                onChange={async (e) => {
                  e.stopPropagation();
                  const nextActive = e.target.checked;
                  await onToggleActive(area.xata_id!, nextActive, area);
                }}
              />
              <span className="text-xs">{isSaving ? 'Guardando…' : (area.activo ? 'Activo' : 'Inactivo')}</span>
              {isSaving && (
                <svg className="animate-spin h-3 w-3 text-gray-300" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
            </label>
          </div>
          
          {/* Acciones */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {isSelected ? 'Seleccionado' : 'Hacer clic para ver'}
            </span>
            <div className="flex items-center space-x-2">
              {/* Botón de descarga JSON */}
              {beaconCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadJSON();
                  }}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-gray-600 hover:bg-gray-500 rounded transition-colors duration-200"
                  title={`Descargar ${area.codigo}_beacons.json`}
                >
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  JSON
                </button>
              )}
              <svg 
                className={`w-4 h-4 transition-transform duration-200 text-gray-400 ${
                  isSelected ? 'rotate-180' : ''
                }`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LevelCardsProps {
  beacons: InfoBeacon[];
  selectedAreaId: string | null;
  onAreaSelect: (areaId: string | null) => void;
}

export default function LevelCards({ beacons, selectedAreaId, onAreaSelect }: LevelCardsProps) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaStats, setAreaStats] = useState<Record<string, number>>({});
  const [savingAreas, setSavingAreas] = useState<Record<string, boolean>>({});
  const { notifications, removeNotification, showSuccess, showError } = useNotifications();

  // Cargar áreas al montar el componente
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const response = await fetch('/api/areas');
        if (response.ok) {
          const data = await response.json() as { value?: Area[] } | Area[];
          setAreas(Array.isArray(data) ? data : data.value || []);
        }
      } catch (error) {
        console.error('Error cargando áreas:', error);
      }
    };
    loadAreas();
  }, []);

  useEffect(() => {
    // Calcular estadísticas por área
    const stats: Record<string, number> = {};
    
    areas.forEach(area => {
      if (area.xata_id) {
        stats[area.xata_id] = beacons.filter(beacon => beacon.areaId === area.xata_id).length;
      }
    });
    
    setAreaStats(stats);
  }, [beacons, areas]);

  const totalBeacons = Object.values(areaStats).reduce((sum, count) => sum + count, 0);

  const handleToggleActive = async (areaId: string, activo: boolean, areaData: Area) => {
    // Optimistic update
    setAreas(prev => prev.map(a => a.xata_id === areaId ? { ...a, activo } : a));
    setSavingAreas(prev => ({ ...prev, [areaId]: true }));
    try {
      const response = await fetch(`/api/areas/${areaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero: areaData.numero,
          nombre: areaData.nombre,
          codigo: areaData.codigo,
          descripcion: areaData.descripcion || '',
          ubicacion: areaData.ubicacion,
          color: areaData.color,
          activo
        })
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Error al actualizar el área');
      }
      showSuccess('Área actualizada', activo ? 'Área marcada como activa' : 'Área marcada como inactiva');
    } catch (error) {
      console.error('Error actualizando activo del área:', error);
      // Revert on error
      setAreas(prev => prev.map(a => a.xata_id === areaId ? { ...a, activo: !activo } : a));
      showError('No se pudo actualizar', 'Intenta de nuevo más tarde');
    } finally {
      setSavingAreas(prev => {
        const copy = { ...prev };
        delete copy[areaId];
        return copy;
      });
    }
  };

  return (
    <div className="space-y-6">
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
      {/* Header con estadísticas generales */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Áreas de Sensores</h2>
            <p className="text-gray-300 mt-1">
              {totalBeacons} sensor{totalBeacons !== 1 ? 'es' : ''} distribuido{totalBeacons !== 1 ? 's' : ''} en {areas.length} áreas
            </p>
          </div>
          
          {/* Botón para ver todos */}
          <button
            onClick={() => onAreaSelect(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedAreaId === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Ver Todos
          </button>
        </div>
      </div>

      {/* Grid de cards por área */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {areas.map(area => (
          <LevelCard
            key={area.xata_id}
            area={area}
            beaconCount={areaStats[area.xata_id!] || 0}
            beacons={beacons}
            onSelect={onAreaSelect}
            isSelected={selectedAreaId === area.xata_id}
            onToggleActive={handleToggleActive}
            isSaving={!!savingAreas[area.xata_id as string]}
          />
        ))}
      </div>

      {/* Información adicional si no hay sensores */}
      {totalBeacons === 0 && (
        <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">No hay sensores registrados</h3>
          <p className="mt-1 text-sm text-gray-400">
            Comienza agregando sensores para verlos organizados por nivel.
          </p>
        </div>
      )}
    </div>
  );
}
