'use client';

import { InfoBeacon } from '@/types';

interface ConfirmDeleteModalProps {
  beacon: InfoBeacon | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDeleteModal({ beacon, onConfirm, onCancel, loading = false }: ConfirmDeleteModalProps) {
  if (!beacon) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800 border-gray-700">
        <div className="mt-3">
          {/* Icono de advertencia */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Contenido */}
          <div className="mt-2 text-center">
            <h3 className="text-lg font-medium text-white">
              ¿Eliminar Beacon?
            </h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-300">
                Esta acción no se puede deshacer. Se eliminará permanentemente el beacon:
              </p>
              <div className="mt-3 bg-gray-700 rounded-lg p-3 text-left">
                <div className="text-sm">
                  <div className="font-medium text-white">{beacon.numSensor}</div>
                  <div className="text-gray-300">Código: {beacon.codSensor}</div>
                  <div className="text-gray-300">ID: {beacon.idenSensor}</div>
                  {beacon.nivel !== undefined && (
                    <div className="text-gray-300">Nivel: {beacon.nivel}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="items-center px-4 py-3">
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 border border-gray-600"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}