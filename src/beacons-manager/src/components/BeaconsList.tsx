'use client';

import { useState, useEffect } from 'react';
import { InfoBeacon } from '@/types';

interface BeaconsListProps {
  onEdit: (beacon: InfoBeacon) => void;
  onDelete: (beacon: InfoBeacon) => void;
  refreshKey?: number;
}

export default function BeaconsList({ onEdit, onDelete, refreshKey }: BeaconsListProps) {
  const [beacons, setBeacons] = useState<InfoBeacon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    nivel: '',
    codSensor: ''
  });

  // Función para normalizar los datos del beacon
  const normalizeBeacon = (beacon: any): InfoBeacon => ({
    ...beacon,
    numSensor: beacon.numSensor || beacon.numsensor,
    codSensor: beacon.codSensor || beacon.codsensor,
    idenSensor: beacon.idenSensor || beacon.idensensor
  });

  const fetchBeacons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.nivel) params.append('nivel', filters.nivel);
      if (filters.codSensor) params.append('codSensor', filters.codSensor);

      const response = await fetch(`/api/beacons?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        console.log('📊 Beacons recibidos:', data.data);
        const normalizedBeacons = data.data.map(normalizeBeacon);
        
        // Ordenar por numSensor
        const sortedBeacons = normalizedBeacons.sort((a, b) => {
          const numA = a.numSensor || '';
          const numB = b.numSensor || '';
          return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: 'base' });
        });
        
        setBeacons(sortedBeacons);
      } else {
        setError(data.error || 'Error al cargar beacons');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeacons();
  }, [filters, refreshKey]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ nivel: '', codSensor: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando beacons...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Nivel</label>
            <input
              type="number"
              className="input-field"
              placeholder="Filtrar por nivel"
              value={filters.nivel}
              onChange={(e) => handleFilterChange('nivel', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Código Sensor</label>
            <input
              type="text"
              className="input-field"
              placeholder="Filtrar por código"
              value={filters.codSensor}
              onChange={(e) => handleFilterChange('codSensor', e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="btn-secondary w-full"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Beacons */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Beacons ({beacons.length})
          </h3>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {beacons.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="mt-2">No hay beacons registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sensor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordenadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {beacons.map((beacon) => (
                  <tr key={beacon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {beacon.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{beacon.numSensor}</div>
                        <div className="text-gray-500">{beacon.codSensor}</div>
                        <div className="text-gray-500">{beacon.idenSensor}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>X: {beacon.x || 'N/A'}</div>
                        <div>Y: {beacon.y || 'N/A'}</div>
                        <div>Z: {beacon.z || 'N/A'}</div>
                        {beacon.unidades && (
                          <div className="text-gray-500 text-xs">{beacon.unidades}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Nivel {beacon.nivel || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(beacon)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(beacon)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}