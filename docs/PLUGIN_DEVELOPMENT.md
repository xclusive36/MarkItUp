# MarkItUp Plugin Development Guide

This guide covers everything you need to know about developing plugins for MarkItUp PKM.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Plugin Architecture](#plugin-architecture)
3. [Plugin Manifest](#plugin-manifest)
4. [Plugin API](#plugin-api)
5. [Development Workflow](#development-workflow)
6. [Best Practices](#best-practices)
7. [Security Considerations](#security-considerations)
8. [Publishing Plugins](#publishing-plugins)

## Getting Started

### Prerequisites

* Node.js 18+
* TypeScript knowledge
* Basic understanding of React (for UI components)
* Familiarity with MarkItUp PKM

### Quick Start

1. **Create a new plugin file**:
   ```typescript
   // src/plugins/my-plugin.ts
   import { PluginManifest } from '../lib/types';

   export const myPlugin: PluginManifest = {
     id: 'my-plugin',
     name: 'My First Plugin',
     version: '1.0.0',
     description: 'A simple example plugin',
     author: 'Your Name',
     main: 'my-plugin.js',
     
     onLoad: async function() {
       console.log('My plugin loaded!');
     }
   };
   ```

2. **Register your plugin**:
   ```typescript
   // In your application
   const pluginManager = pkm.getPluginManager();
   await pluginManager.loadPlugin(myPlugin);
   ```

## Plugin Architecture

### Core Components

* **Plugin Manifest**: Defines plugin metadata and configuration
* **Plugin Manager**: Handles plugin lifecycle and API access
* **Plugin API**: Provides controlled access to system functionality
* **Event System**: Enables plugin communication
* **Settings Manager**: Handles plugin configuration persistence

### Plugin Lifecycle

1. **Validation**: Plugin manifest is validated
2. **Dependency Check**: Required dependencies are verified
3. **API Creation**: Plugin receives isolated API instance
4. **Loading**: `onLoad` hook is executed
5. **Registration**: Commands, views, and processors are registered
6. **Active**: Plugin is fully operational
7. **Unloading**: `onUnload` hook is executed when removed

## Plugin Manifest

### Basic Structure

```typescript
interface PluginManifest {
  // Required fields
  id: string;                    // Unique identifier
  name: string;                  // Display name
  version: string;               // Semantic version
  description: string;           // Brief description
  author: string;                // Author name
  main: string;                  // Entry point file

  // Optional fields
  dependencies?: string[];       // Plugin dependencies
  permissions?: PluginPermission[]; // Required permissions
  minVersion?: string;           // Min MarkItUp version
  maxVersion?: string;           // Max MarkItUp version
  
  // Functionality
  settings?: PluginSetting[];    // Configuration options
  commands?: Command[];          // Custom commands
  views?: PluginView[];          // UI components
  processors?: ContentProcessor[]; // Content transformers
  
  // Lifecycle hooks
  onLoad?: () => void | Promise<void>;
  onUnload?: () => void | Promise<void>;
}
```

### Settings Configuration

```typescript
interface PluginSetting {
  id: string;                    // Setting identifier
  name: string;                  // Display name
  type: 'string' | 'number' | 'boolean' | 'select' | 'file' | 'folder';
  default: any;                  // Default value
  description?: string;          // Help text
  options?: Array<{              // For 'select' type
    label: string;
    value: any;
  }>;
}
```

### Commands

```typescript
interface Command {
  id: string;                    // Command identifier
  name: string;                  // Display name
  description: string;           // Help text
  keybinding?: string;           // Keyboard shortcut
  callback: () => void | Promise<void>; // Command function
  condition?: () => boolean;     // When command is available
}
```

### Content Processors

```typescript
interface ContentProcessor {
  id: string;                    // Processor identifier
  name: string;                  // Display name
  type: 'markdown' | 'export' | 'import' | 'transform';
  process: (content: string, context?: any) => string | Promise<string>;
  fileExtensions?: string[];     // Applicable file types
}
```

## Plugin API

### Notes Management

```typescript
// Create a new note
const note = await api.notes.create('Note Name', 'Content', 'folder');

// Update existing note
await api.notes.update(noteId, { content: 'New content' });

// Delete note
await api.notes.delete(noteId);

// Get note by ID
const note = api.notes.get(noteId);

// Get all notes
const notes = api.notes.getAll();

// Search notes
const results = api.notes.search('query');
```

### UI Interactions

```typescript
// Show notification
api.ui.showNotification('Success!', 'info');

// Show modal dialog
const result = await api.ui.showModal('Title', <Component />);

// Add custom command
api.ui.addCommand({
  id: 'my-command',
  name: 'My Command',
  callback: () => console.log('Executed!')
});

// Update status bar
api.ui.setStatusBarText('Processing...');
```

### Event System

```typescript
// Listen for events
api.events.on('note-created', (event) => {
  console.log('New note:', event.noteId);
});

// Emit custom events
api.events.emit('my-plugin-event', { data: 'value' });

// Remove event listener
api.events.off('note-created', callback);
```

### Settings Management

```typescript
// Get setting value
const value = api.settings.get('my-setting');

// Set setting value
api.settings.set('my-setting', 'new-value');
```

### File System (with permission)

```typescript
// Read file (requires file-system permission)
const content = await api.fs.readFile('/path/to/file');

// Write file
await api.fs.writeFile('/path/to/file', 'content');

// Check if file exists
const exists = await api.fs.exists('/path/to/file');
```

## Development Workflow

### 1. Local Development

```bash
# Clone the repository
git clone https://github.com/xclusive36/MarkItUp.git
cd MarkItUp

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Plugin Development

1. Create your plugin file in `src/plugins/`
2. Add it to the plugin registry
3. Test using the plugin manager
4. Iterate and refine

### 3. Testing

```typescript
// Example test setup
describe('My Plugin', () => {
  let pluginManager: PluginManager;
  
  beforeEach(() => {
    pluginManager = new PluginManager(mockPKMSystem);
  });
  
  it('should load successfully', async () => {
    const result = await pluginManager.loadPlugin(myPlugin);
    expect(result).toBe(true);
  });
});
```

## Best Practices

### Code Organization

* Keep plugin logic modular and focused
* Separate UI components from business logic
* Use TypeScript for type safety
* Follow consistent naming conventions

### Performance

* Minimize API calls in tight loops
* Use event debouncing for expensive operations
* Clean up resources in `onUnload`
* Avoid blocking the main thread

### User Experience

* Provide clear command names and descriptions
* Include helpful setting descriptions
* Show progress for long-running operations
* Handle errors gracefully with user feedback

### Error Handling

```typescript
try {
  const result = await api.notes.create(name, content);
  api.ui.showNotification('Note created successfully!', 'info');
} catch (error) {
  api.ui.showNotification('Failed to create note: ' + error.message, 'error');
}
```

## Security Considerations

### Permissions

Always declare the minimum required permissions:

```typescript
permissions: [
  {
    type: 'file-system',
    description: 'Required to save exported files'
  }
]
```

### Input Validation

```typescript
// Validate user input
function validateInput(input: string): boolean {
  if (!input || input.length > 1000) {
    return false;
  }
  // Additional validation...
  return true;
}
```

### Safe API Usage

* Never store sensitive data in plugin settings
* Validate all external inputs
* Use the provided API methods instead of direct access
* Handle permission denials gracefully

## Publishing Plugins

### 1. Prepare Plugin

* Ensure all dependencies are declared
* Test thoroughly across different scenarios
* Document settings and commands
* Create screenshots/demos

### 2. Create Plugin Package

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Your Name",
  "main": "my-plugin.js",
  "repository": "https://github.com/username/my-plugin",
  "license": "MIT",
  "keywords": ["markitup", "plugin", "productivity"]
}
```

### 3. Distribution

* Share plugin manifest files
* Publish to plugin registry (future)
* Include documentation and examples
* Provide installation instructions

## Examples

See `src/plugins/example-plugins.ts` for comprehensive examples including:

* Word count and statistics
* Export functionality
* Daily notes management
* Table of contents generation
* Backup automation
* Citation management
* Theme customization
* Kanban boards

## Support

* GitHub Issues: Report bugs and request features
* Documentation: This guide and inline code comments
* Community: Share plugins and get help
* Examples: Study existing plugins for patterns

## API Reference

For complete API documentation, see the TypeScript definitions in:
* `src/lib/types.ts` - Core interfaces
* `src/lib/plugin-manager.ts` - Plugin management
* `src/components/PluginStore.tsx` - UI components
