'use client';

import { useState, useEffect } from 'react';
import { InfoBeacon, Area } from '@/types';
import BeaconsForm from './BeaconsForm';

interface FilteredBeaconsListProps {
  beacons: InfoBeacon[];
  selectedAreaId: string | null;
  onEdit: (beacon: InfoBeacon) => void;
  onDelete: (beacon: InfoBeacon) => void;
  onSave: (beaconData: Partial<InfoBeacon>[]) => Promise<void>;
  onSaveSingle: (beaconData: Partial<InfoBeacon>) => Promise<void>;
  formLoading?: boolean;
  areas?: Area[]; // Recibir áreas como prop
}

export default function FilteredBeaconsList({ beacons, selectedAreaId, onEdit, onDelete, onSave, onSaveSingle, formLoading = false, areas = [] }: FilteredBeaconsListProps) {
  const [filteredBeacons, setFilteredBeacons] = useState<InfoBeacon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBeaconId, setEditingBeaconId] = useState<string | null>(null);

  useEffect(() => {
    let filtered = beacons;


    // Filtrar por área si está seleccionada
    if (selectedAreaId !== null) {
      filtered = filtered.filter(beacon => beacon.areaId === selectedAreaId);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(beacon => 
        beacon.numSensor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beacon.codSensor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beacon.idenSensor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por numSensor
    filtered = filtered.sort((a, b) => {
      const numA = a.numSensor || '';
      const numB = b.numSensor || '';
      return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: 'base' });
    });

    setFilteredBeacons(filtered);
  }, [beacons, selectedAreaId, searchTerm]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-red-100 text-red-800';
      case 6: return 'bg-blue-900 text-blue-100';
      case 7: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditClick = (beacon: InfoBeacon) => {
    setEditingBeaconId(beacon.id?.toString() || null);
  };

  const handleCancelEdit = () => {
    setEditingBeaconId(null);
  };

  const handleSaveEdit = async (beaconData: Partial<InfoBeacon>[]) => {
    // Para edición individual, solo tomamos el primer elemento del array
    if (beaconData.length > 0) {
      await onSaveSingle(beaconData[0]);
    }
    setEditingBeaconId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header con información del filtro */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {selectedAreaId !== null ? (
                'Sensores del Área Seleccionada'
              ) : (
                'Todos los Sensores'
              )}
            </h3>
            <p className="text-gray-300 mt-1">
              {filteredBeacons.length} sensor{filteredBeacons.length !== 1 ? 'es' : ''} encontrado{filteredBeacons.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar sensores..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
              />
            </div>
            
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de beacons */}
      {filteredBeacons.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-sm p-8 text-center border border-gray-700">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">
            {searchTerm ? 'No se encontraron sensores' : 'No hay sensores en este nivel'}
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda.'
              : 'Agrega sensores para este nivel o selecciona otro nivel.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Sensor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Coordenadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredBeacons.map((beacon) => (
                  <>
                    <tr key={beacon.id} className="hover:bg-gray-700 transition-colors duration-150">
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="space-y-1">
                          <div className="font-medium text-white">Sensor: {beacon.numSensor}</div>
                          <div className="text-gray-400 text-xs">Codigo: {beacon.codSensor}</div>
                          <div className="text-gray-400 text-xs">ID: {beacon.idenSensor}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-xs">X:</span>
                            <span className="font-mono text-sm text-white">{beacon.x || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-xs">Y:</span>
                            <span className="font-mono text-sm text-white">{beacon.y || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-xs">Z:</span>
                            <span className="font-mono text-sm text-white">{beacon.z || 'N/A'}</span>
                          </div>
                          {beacon.unidades && (
                            <div className="text-gray-400 text-xs">{beacon.unidades}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(beacon.nivel || 0)}`}>
                          Nivel {beacon.nivel || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editingBeaconId === beacon.id?.toString() ? handleCancelEdit() : handleEditClick(beacon)}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-150"
                          >
                            {editingBeaconId === beacon.id?.toString() ? 'Cerrar' : 'Editar'}
                          </button>
                          {editingBeaconId !== beacon.id?.toString() && (
                            <button
                              onClick={() => onDelete(beacon)}
                              className="text-red-400 hover:text-red-300 font-medium transition-colors duration-150"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Fila expandible con formulario de edición */}
                    {editingBeaconId === beacon.id?.toString() && (
                      <tr>
                        <td colSpan={4} className="px-0 py-0">
                          <div className="bg-gray-700 border-t border-gray-600">
                            <div className="p-6">
                              <BeaconsForm
                                onSave={handleSaveEdit}
                                onCancel={handleCancelEdit}
                                loading={formLoading}
                                editingBeacon={beacon}
                                areas={areas}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
