'use client';

import { useState, useEffect } from 'react';

interface DatabaseStatus {
  database: {
    isConnected: boolean;
    tableExists: boolean;
    recordCount: number;
    error?: string;
  };
  timestamp: string;
  status: 'healthy' | 'unhealthy';
}

export default function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error al verificar el estado de la base de datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-800">Verificando base de datos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800">Error: {error}</span>
          </div>
          <button
            onClick={checkDatabaseStatus}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const isHealthy = status.status === 'healthy';

  return (
    <div className={`border rounded-lg p-4 ${isHealthy ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className={`w-5 h-5 mr-2 ${isHealthy ? 'text-green-600' : 'text-yellow-600'}`} fill="currentColor" viewBox="0 0 20 20">
            {isHealthy ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            )}
          </svg>
          <div>
            <span className={`font-medium ${isHealthy ? 'text-green-800' : 'text-yellow-800'}`}>
              Base de datos: {isHealthy ? 'Conectada' : 'Problemas detectados'}
            </span>
            <div className="text-sm text-gray-600 mt-1">
              <span>Registros: {status.database.recordCount}</span>
              <span className="mx-2">•</span>
              <span>Última verificación: {new Date(status.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        <button
          onClick={checkDatabaseStatus}
          className={`text-sm px-3 py-1 rounded ${isHealthy ? 'text-green-600 hover:text-green-800' : 'text-yellow-600 hover:text-yellow-800'}`}
        >
          Verificar
        </button>
      </div>
      
      {status.database.error && (
        <div className="mt-2 text-sm text-red-600">
          Error: {status.database.error}
        </div>
      )}
    </div>
  );
}
