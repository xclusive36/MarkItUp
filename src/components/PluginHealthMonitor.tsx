'use client';

import React, { useState, useEffect } from 'react';
import { PluginHealth, PermissionRequest } from '../lib/types';

interface PluginHealthMonitorProps {
  pluginManager?: {
    getAllPluginHealth?: () => Map<string, PluginHealth>;
    getPluginPermissions?: (pluginId: string) => PermissionRequest[];
    requestPermission?: (pluginId: string, permission: string, reason: string) => Promise<boolean>;
  };
}

export function PluginHealthMonitor({ pluginManager }: PluginHealthMonitorProps) {
  const [healthData, setHealthData] = useState<Map<string, PluginHealth>>(new Map());
  const [alerts, setAlerts] = useState<Array<{ pluginId: string; message: string; type: 'warning' | 'error' }>>([]);

  useEffect(() => {
    if (!pluginManager) return;

    const updateHealth = () => {
      const health = pluginManager.getAllPluginHealth?.() || new Map();
      setHealthData(health);

      // Generate alerts for problematic plugins
      const newAlerts: Array<{ pluginId: string; message: string; type: 'warning' | 'error' }> = [];
      
      health.forEach((healthData, pluginId) => {
        if (healthData.status === 'error') {
          newAlerts.push({
            pluginId,
            message: `Plugin has ${healthData.errorCount} errors. Last: ${healthData.lastError}`,
            type: 'error'
          });
        } else if (healthData.status === 'warning') {
          newAlerts.push({
            pluginId,
            message: `Plugin experiencing issues (${healthData.errorCount} errors)`,
            type: 'warning'
          });
        }
        
        // Performance warnings
        if (healthData.responseTime > 1000) {
          newAlerts.push({
            pluginId,
            message: `Slow response time: ${healthData.responseTime.toFixed(2)}ms`,
            type: 'warning'
          });
        }
      });

      setAlerts(newAlerts);
    };

    updateHealth();
    const interval = setInterval(updateHealth, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [pluginManager]);

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'warning': return '🟡';
      case 'error': return '🔴';
      case 'disabled': return '⚫';
      default: return '⚪';
    }
  };

  const dismissAlert = (index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  if (!pluginManager) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Plugin manager not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Health Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg flex items-center justify-between ${
                alert.type === 'error' 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {alert.type === 'error' ? '⚠️' : '🔔'}
                </span>
                <div>
                  <p className={`text-sm font-medium ${
                    alert.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {alert.pluginId}
                  </p>
                  <p className={`text-xs ${
                    alert.type === 'error' ? 'text-red-600 dark:text-red-300' : 'text-yellow-600 dark:text-yellow-300'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => dismissAlert(index)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Health Status Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Plugin Health Status
        </h3>
        
        {healthData.size === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No plugins loaded
          </p>
        ) : (
          <div className="space-y-3">
            {Array.from(healthData.entries()).map(([pluginId, health]) => (
              <div
                key={pluginId}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getHealthIcon(health.status)}</span>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {pluginId}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {health.status}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <p className="font-medium">{health.executionCount || 0}</p>
                    <p>Executions</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-medium">{health.responseTime?.toFixed(1) || 0}ms</p>
                    <p>Response</p>
                  </div>
                  
                  <div className="text-center">
                    <p className={`font-medium ${health.errorCount > 0 ? 'text-red-600' : ''}`}>
                      {health.errorCount}
                    </p>
                    <p>Errors</p>
                  </div>
                  
                  {health.lastExecuted && (
                    <div className="text-center">
                      <p className="font-medium">
                        {new Date(health.lastExecuted).toLocaleTimeString()}
                      </p>
                      <p>Last Run</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Average Response Time
          </h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Array.from(healthData.values())
              .reduce((sum, health) => sum + (health.responseTime || 0), 0) / 
              Math.max(healthData.size, 1)
            }ms
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total Executions
          </h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Array.from(healthData.values())
              .reduce((sum, health) => sum + (health.executionCount || 0), 0)
            }
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total Errors
          </h4>
          <p className="text-2xl font-bold text-red-600">
            {Array.from(healthData.values())
              .reduce((sum, health) => sum + health.errorCount, 0)
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export default PluginHealthMonitor;
