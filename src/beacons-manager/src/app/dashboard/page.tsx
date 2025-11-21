'use client';

import { useAuth } from '@/components/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BeaconsList from '@/components/BeaconsList';
import BeaconsForm from '@/components/BeaconsForm';
import LevelCards from '@/components/LevelCards';
import FilteredBeaconsList from '@/components/FilteredBeaconsList';
import AreaManager from '@/components/AreaManager';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Alert from '@/components/Alert';
import { InfoBeacon, Area } from '@/types';
import Image from 'next/image';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  
  const [showForm, setShowForm] = useState(false);
  const [editingBeacon, setEditingBeacon] = useState<InfoBeacon | null>(null);
  const [deletingBeacon, setDeletingBeacon] = useState<InfoBeacon | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [allBeacons, setAllBeacons] = useState<InfoBeacon[]>([]);
  const [levels, setLevels] = useState<Area[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sensors' | 'areas'>('sensors');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadAllBeacons = async () => {
    try {
      const response = await fetch('/api/beacons');
      const data = await response.json() as { success: boolean; data: any[]; error?: string };
      
      if (data.success) {
        // Normalizar los datos como en BeaconsList
        const normalizeBeacon = (beacon: any): InfoBeacon => {
          const normalized = {
            ...beacon,
            numSensor: beacon.numSensor || beacon.numsensor,
            codSensor: beacon.codSensor || beacon.codsensor,
            idenSensor: beacon.idenSensor || beacon.idensensor,
            areaId: beacon.areaId || beacon.areaid
          };
          
          
          return normalized;
        };
        
        const normalizedBeacons = data.data.map(normalizeBeacon);
        
        // Ordenar por numSensor
        const sortedBeacons = normalizedBeacons.sort((a, b) => {
          const numA = a.numSensor || '';
          const numB = b.numSensor || '';
          return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: 'base' });
        });
        
        setAllBeacons(sortedBeacons);
      }
    } catch (error) {
      console.error('Error al cargar beacons:', error);
    }
  };

  useEffect(() => {
    loadAllBeacons();
  }, [refreshKey]);

  // Cargar áreas al inicio
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const response = await fetch('/api/areas');
        if (response.ok) {
          const data = await response.json() as { success: boolean; value: any[]; Count: number };
          const areasArray = data.value || data;
          const normalizedAreas = Array.isArray(areasArray) ? areasArray : [];
          setAreas(normalizedAreas);
          setLevels(normalizedAreas); // También actualizar levels para compatibilidad
        }
      } catch (error) {
        console.error('Error cargando áreas:', error);
        setAreas([]);
        setLevels([]);
      }
    };
    loadAreas();
  }, []);

  const handleAddBeacons = () => {
    setEditingBeacon(null);
    setShowForm(true);
  };

  const handleEditBeacon = (beacon: InfoBeacon) => {
    setEditingBeacon(beacon);
    setShowForm(true);
  };

  const handleDeleteBeacon = (beacon: InfoBeacon) => {
    setDeletingBeacon(beacon);
  };

  const handleSaveBeacon = async (beaconData: Partial<InfoBeacon>) => {
    try {
      setFormLoading(true);
      
      // Determinar si es edición basándose en si hay un ID en los datos o en editingBeacon
      const isEditing = editingBeacon || beaconData.id;
      const beaconId = editingBeacon?.id || beaconData.id;
      
      const url = isEditing ? `/api/beacons/${beaconId}` : '/api/beacons';
      const method = isEditing ? 'PATCH' : 'POST';


      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(beaconData),
      });

      const data = await response.json() as { success: boolean; message?: string; error?: string };

      if (data.success) {
        showAlert('success', isEditing ? 'Beacon actualizado exitosamente' : 'Beacon creado exitosamente');
        setShowForm(false);
        setEditingBeacon(null);
        // Refrescar la lista de beacons
        setRefreshKey(prev => prev + 1);
      } else {
        showAlert('error', data.error || 'Error al guardar beacon');
      }
    } catch (error) {
      showAlert('error', 'Error de conexión');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveBeacons = async (beaconsData: Partial<InfoBeacon>[]) => {
    try {
      setFormLoading(true);
      
      const response = await fetch('/api/beacons/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ beacons: beaconsData }),
      });

      const data = await response.json() as { success: boolean; message?: string; error?: string };

      if (data.success) {
        showAlert('success', data.message || `${beaconsData.length} beacons creados exitosamente`);
        setShowForm(false);
        // Refrescar la lista de beacons
        setRefreshKey(prev => prev + 1);
      } else {
        showAlert('error', data.error || 'Error al crear beacons');
      }
    } catch (error) {
      showAlert('error', 'Error de conexión');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBeacon) return;

    try {
      setDeleteLoading(true);
      
      const response = await fetch(`/api/beacons/${deletingBeacon.id}`, {
        method: 'DELETE',
      });

      const data = await response.json() as { success: boolean; message?: string; error?: string };

      if (data.success) {
        showAlert('success', 'Beacon eliminado exitosamente');
        setDeletingBeacon(null);
        // Refrescar la lista de beacons
        setRefreshKey(prev => prev + 1);
      } else {
        showAlert('error', data.error || 'Error al eliminar beacon');
      }
    } catch (error) {
      showAlert('error', 'Error de conexión');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBeacon(null);
  };

  const handleAreasChange = (newAreas: Area[]) => {
    setLevels(newAreas);
    setAreas(newAreas); // También actualizar areas
  };

  const handleCancelDelete = () => {
    setDeletingBeacon(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-8 w-8 flex items-center justify-center">
                <Image src="/icon.png" alt="AR TOUR UVG" width={32} height={32} className="h-8 w-8 rounded-full" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-white">AR TOUR UVG - Beacons Manager</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Hola, {user.username}</span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('sensors')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'sensors'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <svg className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Gestión de Sensores
              </button>
              <button
                onClick={() => setActiveTab('areas')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'areas'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <svg className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Gestión de Áreas
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'sensors' && (
          <>
            {/* Botón para agregar sensores */}
            <div className="mb-6">
              <button
                onClick={handleAddBeacons}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Sensores
              </button>
            </div>

        {/* Formulario de Sensores */}
        {showForm && (
          <div className="mb-8">
            <BeaconsForm
              onSave={handleSaveBeacons}
              onCancel={handleCancelForm}
              loading={formLoading}
              editingBeacon={editingBeacon}
              areas={areas}
            />
          </div>
        )}

        {/* Cards de Niveles */}
            <LevelCards 
              beacons={allBeacons} 
              selectedAreaId={selectedAreaId} 
              onAreaSelect={setSelectedAreaId} 
            />

        {/* Lista Filtrada de Beacons */}
        <FilteredBeaconsList
          beacons={allBeacons}
          selectedAreaId={selectedAreaId}
          onEdit={handleEditBeacon}
          onDelete={handleDeleteBeacon}
          onSave={handleSaveBeacons}
          onSaveSingle={handleSaveBeacon}
          formLoading={formLoading}
          areas={areas}
        />

            {/* Modal de Confirmación de Eliminación */}
            <ConfirmDeleteModal
              beacon={deletingBeacon}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
              loading={deleteLoading}
            />
          </>
        )}

        {/* Tab de Gestión de Áreas */}
        {activeTab === 'areas' && (
          <AreaManager onAreasChange={handleAreasChange} />
        )}
      </main>
    </div>
  );
}