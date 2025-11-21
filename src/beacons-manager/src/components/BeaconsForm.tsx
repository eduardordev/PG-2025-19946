'use client';

import { useState, useEffect } from 'react';
import { InfoBeacon, Area } from '@/types';

interface BeaconsFormProps {
  onSave: (beacons: Partial<InfoBeacon>[]) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  editingBeacon?: InfoBeacon | null;
  areas?: Area[]; // Recibir áreas como prop
}

interface SensorData {
  id: string;
  numSensor: string;
  idenSensor: string;
  x: string;
  y: string;
  unidades: string;
  areaId: string; // Cambiar de nivel a areaId
}

export default function BeaconsForm({ onSave, onCancel, loading = false, editingBeacon, areas = [] }: BeaconsFormProps) {
  const [sensors, setSensors] = useState<SensorData[]>(() => {
    if (editingBeacon) {
      return [{
        id: '1',
        numSensor: editingBeacon.numSensor || '',
        idenSensor: editingBeacon.idenSensor || '',
        x: editingBeacon.x?.toString() || '',
        y: editingBeacon.y?.toString() || '',
        unidades: editingBeacon.unidades || 'metros',
        areaId: editingBeacon.areaId?.toString() || ''
      }];
    }
    return [{
      id: '1',
      numSensor: '',
      idenSensor: '',
      x: '',
      y: '',
      unidades: 'metros',
      areaId: ''
    }];
  });
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  // Las áreas ahora se reciben como prop, no se cargan aquí

  const addSensor = () => {
    const newId = (sensors.length + 1).toString();
    setSensors(prev => [
      ...prev,
      {
        id: newId,
        numSensor: '',
        idenSensor: '',
        x: '',
        y: '',
        unidades: 'metros',
        areaId: ''
      }
    ]);
  };

  const removeSensor = (id: string) => {
    if (sensors.length > 1) {
      setSensors(prev => prev.filter(sensor => sensor.id !== id));
      // Limpiar errores del sensor eliminado
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const updateSensor = (id: string, field: keyof SensorData, value: string) => {
    setSensors(prev => 
      prev.map(sensor => 
        sensor.id === id ? { ...sensor, [field]: value } : sensor
      )
    );
    
    // Limpiar error del campo actualizado
    setErrors(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: ''
      }
    }));
  };

  const validateSensor = (sensor: SensorData): Record<string, string> => {
    const sensorErrors: Record<string, string> = {};

    if (!sensor.numSensor.trim()) {
      sensorErrors.numSensor = 'Número de sensor es requerido';
    }
    if (!sensor.idenSensor.trim()) {
      sensorErrors.idenSensor = 'Identificación de sensor es requerida';
    }
    if (!sensor.areaId.trim()) {
      sensorErrors.areaId = 'Área es requerida';
    }

    // Validar números
    if (sensor.x && isNaN(Number(sensor.x))) {
      sensorErrors.x = 'X debe ser un número válido';
    }
    if (sensor.y && isNaN(Number(sensor.y))) {
      sensorErrors.y = 'Y debe ser un número válido';
    }
    if (sensor.areaId && !areas.find(area => area.xata_id === sensor.areaId)) {
      sensorErrors.areaId = 'Área no válida';
    }

    return sensorErrors;
  };

  const validateAllSensors = (): boolean => {
    const allErrors: Record<string, Record<string, string>> = {};
    let isValid = true;

    sensors.forEach(sensor => {
      const sensorErrors = validateSensor(sensor);
      if (Object.keys(sensorErrors).length > 0) {
        allErrors[sensor.id] = sensorErrors;
        isValid = false;
      }
    });

    setErrors(allErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllSensors()) {
      return;
    }

    const beaconsData: Partial<InfoBeacon>[] = sensors.map(sensor => {
      const selectedArea = areas.find(area => area.xata_id === sensor.areaId);
      return {
        id: editingBeacon?.id, // Incluir el ID cuando se está editando
        numSensor: sensor.numSensor.trim(),
        codSensor: `${selectedArea?.codigo || 'UNK'}-${sensor.numSensor}`,
        idenSensor: sensor.idenSensor.trim(),
        unidades: sensor.unidades.trim() || undefined,
        x: sensor.x ? Number(sensor.x) : undefined,
        y: sensor.y ? Number(sensor.y) : undefined,
        z: 1.65, // Valor fijo
        areaId: sensor.areaId || undefined,
        nivel: selectedArea?.numero // Mantener para compatibilidad
      };
    });


    await onSave(beaconsData);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">
          {editingBeacon ? 'Editar Sensor' : 'Agregar Sensores'}
        </h3>
        <p className="text-sm text-gray-300">
          {editingBeacon 
            ? 'Modifica la información del sensor seleccionado.'
            : 'Agrega uno o múltiples sensores. Puedes agregar más sensores usando el botón "Agregar Otro Sensor".'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-8">
          {sensors.map((sensor, index) => (
            <div key={sensor.id} className="border border-gray-600 rounded-lg p-6 bg-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-semibold text-white text-lg">
                  Sensor #{index + 1}
                </h4>
                {sensors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSensor(sensor.id)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 rounded-md border border-red-400 hover:border-red-300 transition-colors duration-200"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información del Sensor */}
                <div className="space-y-5">
                  <div>
                    <label className="label">Área *</label>
                    <select
                      className={`input-field ${errors[sensor.id]?.areaId ? 'border-red-500' : ''}`}
                      value={sensor.areaId}
                      onChange={(e) => updateSensor(sensor.id, 'areaId', (e.target as HTMLSelectElement).value)}
                    >
                      <option value="">Selecciona un área</option>
                      {areas.map(area => (
                        <option key={area.xata_id} value={area.xata_id?.toString()}>
                          {area.nombre} ({area.codigo}) - {area.ubicacion}
                        </option>
                      ))}
                    </select>
                    {errors[sensor.id]?.areaId && (
                      <p className="mt-1 text-sm text-red-600">{errors[sensor.id].areaId}</p>
                    )}
                  </div>


                  <div>
                    <label className="label">Número de Sensor *</label>
                    <input
                      type="text"
                      className={`input-field ${errors[sensor.id]?.numSensor ? 'border-red-500' : ''}`}
                      placeholder="Ej: SENSOR001"
                      value={sensor.numSensor}
                      onChange={(e) => updateSensor(sensor.id, 'numSensor', (e.target as HTMLInputElement).value)}
                    />
                    {errors[sensor.id]?.numSensor && (
                      <p className="mt-1 text-sm text-red-600">{errors[sensor.id].numSensor}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Código de Sensor</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="input-field bg-gray-50 text-gray-600 cursor-not-allowed"
                        placeholder="Se genera automáticamente"
                        value={sensor.areaId && sensor.numSensor ? `${areas.find(a => a.xata_id === sensor.areaId)?.codigo || 'UNK'}-${sensor.numSensor}` : ''}
                        readOnly
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-300">
                      Se genera automáticamente como: codigoArea-numSensor
                    </p>
                  </div>

                  <div>
                    <label className="label">Identificación de Sensor *</label>
                    <input
                      type="text"
                      className={`input-field ${errors[sensor.id]?.idenSensor ? 'border-red-500' : ''}`}
                      placeholder="Ej: ID001"
                      value={sensor.idenSensor}
                      onChange={(e) => updateSensor(sensor.id, 'idenSensor', (e.target as HTMLInputElement).value)}
                    />
                    {errors[sensor.id]?.idenSensor && (
                      <p className="mt-1 text-sm text-red-600">{errors[sensor.id].idenSensor}</p>
                    )}
                  </div>
                </div>

                {/* Coordenadas */}
                <div className="space-y-5">
                  <h4 className="font-medium text-white text-lg">Coordenadas</h4>
                  
                  <div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="label">X</label>
                        <input
                          type="number"
                          step="any"
                          className={`w-full px-2 py-1 text-sm border border-gray-600 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 ${errors[sensor.id]?.x ? 'border-red-500' : ''}`}
                          placeholder="0.0"
                          value={sensor.x}
                          onChange={(e) => updateSensor(sensor.id, 'x', (e.target as HTMLInputElement).value)}
                        />
                        {errors[sensor.id]?.x && (
                          <p className="mt-1 text-xs text-red-600">{errors[sensor.id].x}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Y</label>
                        <input
                          type="number"
                          step="any"
                          className={`w-full px-2 py-1 text-sm border border-gray-600 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 ${errors[sensor.id]?.y ? 'border-red-500' : ''}`}
                          placeholder="0.0"
                          value={sensor.y}
                          onChange={(e) => updateSensor(sensor.id, 'y', (e.target as HTMLInputElement).value)}
                        />
                        {errors[sensor.id]?.y && (
                          <p className="mt-1 text-xs text-red-600">{errors[sensor.id].y}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Z</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            className="w-full px-2 py-1 text-sm border border-gray-600 rounded shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                            placeholder="1.65"
                            value="1.65"
                            readOnly
                          />
                          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-300">
                      Valor fijo: 1.65 metros
                    </p>
                  </div>

                  <div>
                    <label className="label">Unidades</label>
                    <input
                      type="text"
                      className="input-field bg-gray-50 text-gray-600 cursor-not-allowed"
                      value="metros"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón para agregar más sensores - solo en modo crear */}
        {!editingBeacon && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={addSensor}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Otro Sensor
            </button>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : editingBeacon ? 'Actualizar Sensor' : `Crear ${sensors.length} Sensor${sensors.length > 1 ? 'es' : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
}
