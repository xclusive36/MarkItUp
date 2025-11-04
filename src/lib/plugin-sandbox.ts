/**
 * Plugin Sandbox - Security layer for the plugin system
 *
 * Restricts plugin access to the PluginAPI based on declared permissions.
 * Prevents malicious plugins from accessing unauthorized functionality.
 *
 * @example
 * ```typescript
 * const sandbox = new PluginSandbox(['notes', 'ui', 'settings']);
 * const sandboxedAPI = sandbox.createSandboxedAPI(fullAPI);
 * // Plugin can only access notes, ui, and settings - not events or other APIs
 * ```
 */

import { PluginAPI, PluginPermission } from './types';

export class PluginSandbox {
  private allowedNamespaces: Set<string>;
  private pluginId: string;
  private strictMode: boolean;

  /**
   * Create a new plugin sandbox
   * @param permissions - List of permissions granted to the plugin
   * @param pluginId - Unique identifier for the plugin (for logging)
   * @param strictMode - If true, throws errors on unauthorized access. If false, logs warnings.
   */
  constructor(permissions: PluginPermission[], pluginId: string, strictMode: boolean = true) {
    this.pluginId = pluginId;
    this.strictMode = strictMode;
    this.allowedNamespaces = new Set();

    // Map permissions to API namespaces
    permissions.forEach(permission => {
      switch (permission.type) {
        case 'file-system':
          this.allowedNamespaces.add('notes');
          break;
        case 'network':
          // Currently no network-specific API namespace
          break;
        case 'ui':
          this.allowedNamespaces.add('ui');
          break;
        case 'settings':
          this.allowedNamespaces.add('settings');
          break;
        case 'analytics':
          this.allowedNamespaces.add('events'); // Events for analytics
          break;
        default:
          console.warn(`Unknown permission type: ${permission.type}`);
      }
    });

    // Always allow settings namespace (plugins need to access their own settings)
    this.allowedNamespaces.add('settings');

    console.log(
      `[PluginSandbox] Created sandbox for ${pluginId} with permissions:`,
      Array.from(this.allowedNamespaces)
    );
  }

  /**
   * Check if a namespace is allowed
   */
  private isAllowed(namespace: string): boolean {
    return this.allowedNamespaces.has(namespace);
  }

  /**
   * Handle unauthorized access attempt
   */
  private handleUnauthorizedAccess(namespace: string, property: string): void {
    const message = `Plugin "${this.pluginId}" attempted to access unauthorized API: ${namespace}.${property}`;

    // Log to console (analytics doesn't support security_event yet)
    console.warn(`[Security] ${message}`);

    if (this.strictMode) {
      throw new Error(message);
    } else {
      console.warn(`[PluginSandbox] ${message}`);
    }
  }

  /**
   * Create a sandboxed version of the PluginAPI
   * Only allows access to permitted namespaces
   */
  createSandboxedAPI(fullAPI: PluginAPI): PluginAPI {
    const self = this;

    // Create a proxy for the entire API object
    return new Proxy(fullAPI, {
      get(target, namespace: string) {
        // Allow access to built-in properties
        if (
          typeof namespace === 'symbol' ||
          namespace === 'constructor' ||
          namespace === 'toString'
        ) {
          return target[namespace as keyof PluginAPI];
        }

        // Check if namespace is allowed
        if (!self.isAllowed(namespace)) {
          self.handleUnauthorizedAccess(namespace, '(access)');

          // Return a dummy object that logs warnings
          return new Proxy(
            {},
            {
              get() {
                self.handleUnauthorizedAccess(namespace, '(method)');
                return () => {
                  self.handleUnauthorizedAccess(namespace, '(method call)');
                };
              },
            }
          );
        }

        // Return the actual namespace, but wrap it in another proxy for method tracking
        const namespaceObj = target[namespace as keyof PluginAPI];

        if (typeof namespaceObj === 'object' && namespaceObj !== null) {
          return new Proxy(namespaceObj, {
            get(nsTarget, property: string) {
              const value = (nsTarget as any)[property];

              // If it's a function, wrap it for tracking
              if (typeof value === 'function') {
                return function (...args: any[]) {
                  // Log API calls in development
                  if (process.env.NODE_ENV === 'development') {
                    console.log(
                      `[PluginSandbox] ${self.pluginId} called ${namespace}.${property}`,
                      args
                    );
                  }

                  return value.apply(nsTarget, args);
                };
              }

              return value;
            },
          });
        }

        return namespaceObj;
      },
    });
  }

  /**
   * Get list of allowed namespaces
   */
  getAllowedNamespaces(): string[] {
    return Array.from(this.allowedNamespaces);
  }

  /**
   * Check if a specific namespace is allowed
   */
  hasPermission(namespace: string): boolean {
    return this.isAllowed(namespace);
  }

  /**
   * Add a permission at runtime (use with caution!)
   */
  grantPermission(namespace: string): void {
    console.warn(`[PluginSandbox] Granting runtime permission to ${this.pluginId}: ${namespace}`);
    this.allowedNamespaces.add(namespace);
  }

  /**
   * Remove a permission at runtime
   */
  revokePermission(namespace: string): void {
    console.warn(`[PluginSandbox] Revoking permission from ${this.pluginId}: ${namespace}`);
    this.allowedNamespaces.delete(namespace);
  }
}

/**
 * Validate plugin permissions before loading
 */
export function validatePluginPermissions(permissions: PluginPermission[]): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const validTypes = new Set(['file-system', 'network', 'ui', 'settings', 'analytics']);

  permissions.forEach(permission => {
    if (!validTypes.has(permission.type)) {
      warnings.push(`Unknown permission type: ${permission.type}`);
    }

    // Warn about potentially dangerous permissions
    if (permission.type === 'network') {
      warnings.push('Network permission allows external API calls - ensure you trust this plugin');
    }
  });

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Create a minimal sandbox for AI plugins
 * AI plugins get restricted access by default
 */
export function createAIPluginSandbox(pluginId: string, fullAPI: PluginAPI): PluginAPI {
  const sandbox = new PluginSandbox(
    [
      { type: 'file-system', description: 'Read notes for AI analysis' },
      { type: 'ui', description: 'Show notifications and results' },
      { type: 'settings', description: 'Access plugin settings' },
    ],
    pluginId,
    false // Use warning mode for AI plugins
  );

  return sandbox.createSandboxedAPI(fullAPI);
}

/**
 * Create a full-access sandbox for trusted plugins
 */
export function createTrustedPluginSandbox(pluginId: string, fullAPI: PluginAPI): PluginAPI {
  const sandbox = new PluginSandbox(
    [
      { type: 'file-system', description: 'Full file system access' },
      { type: 'network', description: 'Network access' },
      { type: 'ui', description: 'Full UI access' },
      { type: 'settings', description: 'Settings access' },
      { type: 'analytics', description: 'Analytics access' },
    ],
    pluginId,
    false // Trusted plugins get warnings instead of errors
  );

  return sandbox.createSandboxedAPI(fullAPI);
}
