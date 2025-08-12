'use client';

import React, { useState, useEffect } from 'react';
import { PermissionRequest, PluginPermission } from '../lib/types';

interface PluginPermissionsUIProps {
  pluginManager?: {
    getPluginPermissions: (pluginId: string) => PermissionRequest[];
    requestPermission: (pluginId: string, permission: string, reason: string) => Promise<boolean>;
    getLoadedPlugins: () => any[];
  };
}

interface PermissionGroup {
  pluginId: string;
  pluginName: string;
  permissions: PermissionRequest[];
}

export function PluginPermissionsUI({ pluginManager }: PluginPermissionsUIProps) {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PermissionRequest[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [showRevoke, setShowRevoke] = useState<string | null>(null);

  useEffect(() => {
    if (!pluginManager) return;

    const loadPermissions = () => {
      const plugins = pluginManager.getLoadedPlugins();
      const groups: PermissionGroup[] = [];

      plugins.forEach(plugin => {
        const permissions = pluginManager.getPluginPermissions(plugin.id);
        if (permissions.length > 0) {
          groups.push({
            pluginId: plugin.id,
            pluginName: plugin.name,
            permissions
          });
        }
      });

      setPermissionGroups(groups);
      
      // Extract pending requests
      const pending = groups.flatMap(group => 
        group.permissions.filter(p => !p.granted)
      );
      setPendingRequests(pending);
    };

    loadPermissions();
  }, [pluginManager]);

  const handleGrantPermission = async (request: PermissionRequest) => {
    if (!pluginManager) return;

    try {
      const granted = await pluginManager.requestPermission(
        request.pluginId,
        request.permission.type,
        request.reason
      );

      if (granted) {
        // Update the request status
        setPendingRequests(prev => 
          prev.filter(r => r.pluginId !== request.pluginId || r.permission.type !== request.permission.type)
        );
        
        // Reload permissions
        const plugins = pluginManager.getLoadedPlugins();
        const groups: PermissionGroup[] = [];

        plugins.forEach(plugin => {
          const permissions = pluginManager.getPluginPermissions(plugin.id);
          if (permissions.length > 0) {
            groups.push({
              pluginId: plugin.id,
              pluginName: plugin.name,
              permissions
            });
          }
        });

        setPermissionGroups(groups);
      }
    } catch (error) {
      console.error('Failed to grant permission:', error);
    }
  };

  const getPermissionIcon = (type: string) => {
    switch (type) {
      case 'file-system': return '📁';
      case 'network': return '🌐';
      case 'clipboard': return '📋';
      case 'notifications': return '🔔';
      default: return '🔐';
    }
  };

  const getPermissionDescription = (type: string) => {
    switch (type) {
      case 'file-system': return 'Access to read and write files on your system';
      case 'network': return 'Access to make network requests to external services';
      case 'clipboard': return 'Access to read from and write to the clipboard';
      case 'notifications': return 'Permission to show desktop notifications';
      default: return 'Unknown permission type';
    }
  };

  if (!pluginManager) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Plugin manager not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Permission Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-4">
            🔔 Pending Permission Requests
          </h3>
          
          <div className="space-y-3">
            {pendingRequests.map((request, index) => (
              <div
                key={`${request.pluginId}-${request.permission.type}-${index}`}
                className="bg-white dark:bg-gray-800 p-4 rounded border border-yellow-200 dark:border-yellow-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getPermissionIcon(request.permission.type)}</span>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {request.pluginId}
                      </h4>
                      <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {request.permission.type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {request.reason}
                    </p>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getPermissionDescription(request.permission.type)}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleGrantPermission(request)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Grant
                    </button>
                    <button
                      onClick={() => setPendingRequests(prev => 
                        prev.filter(r => r !== request)
                      )}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plugin Permissions Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Plugin Permissions
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage permissions for all installed plugins
          </p>
        </div>
        
        {permissionGroups.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No plugins with permissions found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {permissionGroups.map(group => (
              <div key={group.pluginId} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {group.pluginName}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {group.permissions.length} permission(s)
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.permissions.map((permission, index) => (
                    <div
                      key={`${permission.permission.type}-${index}`}
                      className={`p-3 rounded border ${
                        permission.granted
                          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                          : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getPermissionIcon(permission.permission.type)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {permission.permission.type}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {permission.reason}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            permission.granted
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                          }`}>
                            {permission.granted ? 'Granted' : 'Denied'}
                          </span>
                          
                          {permission.granted && (
                            <button
                              onClick={() => setShowRevoke(
                                showRevoke === `${group.pluginId}-${permission.permission.type}` 
                                  ? null 
                                  : `${group.pluginId}-${permission.permission.type}`
                              )}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {permission.grantedAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          Granted: {new Date(permission.grantedAt).toLocaleString()}
                        </p>
                      )}
                      
                      {showRevoke === `${group.pluginId}-${permission.permission.type}` && (
                        <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded">
                          <p className="text-xs text-red-700 dark:text-red-300 mb-2">
                            Are you sure you want to revoke this permission? The plugin may not function correctly.
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                // In a real implementation, this would revoke the permission
                                console.log(`Revoking ${permission.permission.type} for ${group.pluginId}`);
                                setShowRevoke(null);
                              }}
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                            >
                              Confirm Revoke
                            </button>
                            <button
                              onClick={() => setShowRevoke(null)}
                              className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          🛡️ Security Guidelines
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Only grant permissions that plugins actually need</li>
          <li>• Review permission requests carefully before granting</li>
          <li>• Regularly audit and revoke unnecessary permissions</li>
          <li>• Be cautious with file-system and network permissions</li>
          <li>• Remove plugins you no longer use</li>
        </ul>
      </div>
    </div>
  );
}

export default PluginPermissionsUI;
