'use client';

import { useState, useEffect } from 'react';
import { Area, AreaFormData } from '@/types';
import ConfirmDeleteAreaModal from './ConfirmDeleteAreaModal';
import NotificationContainer, { useNotifications } from './NotificationContainer';

interface AreaManagerProps {
  onAreasChange: (areas: Area[]) => void;
}

export default function AreaManager({ onAreasChange }: AreaManagerProps) {
  const { notifications, showSuccess, showError, showWarning, removeNotification } = useNotifications();
  const [areas, setAreas] = useState<Area[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState<AreaFormData>({
    numero: 1,
    nombre: '',
    codigo: '',
    descripcion: '',
    ubicacion: 'CIT',
    color: '#3B82F6',
    activo: true
  });

  // Colores predefinidos para elegir
  const predefinedColors = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Rojo', value: '#EF4444' },
    { name: 'Amarillo', value: '#F59E0B' },
    { name: 'Púrpura', value: '#8B5CF6' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Cian', value: '#06B6D4' },
    { name: 'Gris', value: '#6B7280' },
    { name: 'Naranja', value: '#F97316' }
  ];

  // Ubicaciones predefinidas
  const predefinedLocations = [
    'CIT',
    'Biblioteca',
    'Cafetería',
    'Auditorio',
    'Laboratorios',
    'Oficinas',
    'Área Verde',
    'Estacionamiento',
    'Gimnasio',
    'Otro'
  ];

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const response = await fetch('/api/areas');
      if (response.ok) {
        const data = await response.json();
        // El endpoint devuelve { success: true, value: [...], Count: n }
        const areasArray = data.value || data;
        setAreas(Array.isArray(areasArray) ? areasArray : []);
        onAreasChange(Array.isArray(areasArray) ? areasArray : []);
      }
    } catch (error) {
      console.error('Error cargando áreas:', error);
      setAreas([]);
      onAreasChange([]);
    }
  };

  const generateCode = (numero: number, ubicacion: string) => {
    const ubicacionCode = ubicacion.substring(0, 3).toUpperCase();
    return `${ubicacionCode}-${numero.toString().padStart(2, '0')}`;
  };

  const handleAddArea = () => {
    setEditingArea(null);
    const nextNumero = Array.isArray(areas) && areas.length > 0 
      ? Math.max(...areas.map(a => a.numero), 0) + 1 
      : 1;
    setFormData({
      numero: nextNumero,
      nombre: '',
      codigo: generateCode(nextNumero, 'CIT'),
      descripcion: '',
      ubicacion: 'CIT',
      color: '#3B82F6',
      activo: true
    });
    setShowForm(true);
  };

  const handleEditArea = (area: Area) => {
    setEditingArea(area);
    setFormData({
      numero: area.numero,
      nombre: area.nombre,
      codigo: area.codigo,
      descripcion: area.descripcion || '',
      ubicacion: area.ubicacion,
      color: area.color,
      activo: area.activo
    });
    setShowForm(true);
  };

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingArea ? `/api/areas/${editingArea.xata_id}` : '/api/areas';
      const method = editingArea ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadAreas();
        setShowForm(false);
        setEditingArea(null);
        if (editingArea) {
          showSuccess('Área Actualizada', `El área "${formData.nombre}" ha sido actualizada correctamente.`);
        } else {
          showSuccess('Área Creada', `El área "${formData.nombre}" ha sido creada correctamente.`);
        }
      } else {
        const errorData = await response.json();
        showError('Error al Guardar', errorData.error || 'No se pudo guardar el área');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error de Conexión', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArea = async (area: Area) => {
    setAreaToDelete(area);
  };

  const confirmDeleteArea = async () => {
    if (!areaToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/areas/${areaToDelete.xata_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadAreas();
        setAreaToDelete(null);
        showSuccess('Área Eliminada', `El área "${areaToDelete.nombre}" ha sido eliminada correctamente.`);
      } else {
        const errorData = await response.json();
        showError('Error al Eliminar', errorData.error || 'No se pudo eliminar el área');
      }
    } catch (error) {
      console.error('Error eliminando área:', error);
      showError('Error de Conexión', 'No se pudo conectar con el servidor');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDeleteArea = () => {
    setAreaToDelete(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingArea(null);
  };

  const updateFormData = (field: keyof AreaFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Generar código automáticamente cuando cambien número o ubicación
      if (field === 'numero' || field === 'ubicacion') {
        newData.codigo = generateCode(newData.numero, newData.ubicacion);
      }
      
      return newData;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestión de Áreas</h2>
            <p className="text-gray-300 mt-1">
              Administra las áreas y ubicaciones de la red de sensores
            </p>
          </div>
          
          <button
            onClick={handleAddArea}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Área
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">
              {editingArea ? 'Editar Área' : 'Agregar Nueva Área'}
            </h3>
            <p className="text-sm text-gray-300">
              {editingArea 
                ? 'Modifica la información del área seleccionada.'
                : 'Crea una nueva área para organizar los sensores.'
              }
            </p>
          </div>

          <form onSubmit={handleSaveArea} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Número de Área *
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    value={formData.numero}
                    onChange={(e) => updateFormData('numero', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Área *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    placeholder="Ej: Área 1, Planta Baja, etc."
                    value={formData.nombre}
                    onChange={(e) => updateFormData('nombre', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Código del Área
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                      placeholder="Se genera automáticamente"
                      value={formData.codigo}
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-300">
                    Se genera automáticamente como: UBICACION-NUMERO
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ubicación *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    value={formData.ubicacion}
                    onChange={(e) => updateFormData('ubicacion', e.target.value)}
                  >
                    {predefinedLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Configuración visual */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color del Área *
                  </label>
                  <div className="space-y-3">
                    <input
                      type="color"
                      className="w-full h-12 border border-gray-600 rounded-md cursor-pointer"
                      value={formData.color}
                      onChange={(e) => updateFormData('color', e.target.value)}
                    />
                    <div className="grid grid-cols-5 gap-2">
                      {predefinedColors.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-8 h-8 rounded border-2 ${
                            formData.color === color.value ? 'border-white' : 'border-gray-600'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => updateFormData('color', color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    placeholder="Descripción opcional del área..."
                    value={formData.descripcion}
                    onChange={(e) => updateFormData('descripcion', e.target.value)}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                    checked={formData.activo}
                    onChange={(e) => updateFormData('activo', e.target.checked)}
                  />
                  <label htmlFor="activo" className="ml-2 text-sm text-gray-300">
                    Área activa
                  </label>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : editingArea ? 'Actualizar Área' : 'Crear Área'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de áreas */}
      <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Área
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {areas.map((area) => (
                <tr key={area.id} className="hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-3"
                        style={{ backgroundColor: area.color }}
                      ></div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {area.nombre}
                        </div>
                        <div className="text-sm text-gray-400">
                          Área {area.numero}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                      {area.codigo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {area.ubicacion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      area.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {area.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditArea(area)}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-150"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteArea(area)}
                        className="text-red-400 hover:text-red-300 font-medium transition-colors duration-150"
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
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteAreaModal
        area={areaToDelete}
        onConfirm={confirmDeleteArea}
        onCancel={cancelDeleteArea}
        loading={deleteLoading}
      />

      {/* Notificaciones */}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </div>
  );
}
