# Plugin System User Guide

Complete guide to using and managing plugins in MarkItUp PKM.

## 🔌 Plugin System Overview

MarkItUp PKM features a comprehensive plugin system that allows you to extend functionality and customize your workflow. The plugin system is designed to be secure, easy to use, and highly extensible.

### Key Features

- **Rich Plugin API**: Access to notes, UI, events, and file system
- **Settings Management**: Configurable plugin settings with persistence
- **Content Processors**: Transform content during import/export operations
- **Custom Commands**: Add keyboard shortcuts and menu items
- **Event System**: Plugin communication through events
- **Security Model**: Permission-based access control for plugins

## 🚀 Getting Started with Plugins

### Accessing the Plugin System

1. **Open MarkItUp** in your browser
2. **Navigate to Plugin Store** via the main menu
3. **Browse available plugins** or upload custom ones
4. **Install desired plugins** with one click
5. **Configure settings** as needed

### Plugin Store Interface

The plugin store provides three main sections:

#### Plugin Store
- **Browse available plugins**: Curated collection of useful plugins
- **Plugin categories**: Organized by functionality
- **Plugin details**: Descriptions, features, and requirements
- **Installation**: One-click installation process

#### Plugin Manager
- **Installed plugins**: View all active plugins
- **Enable/disable**: Toggle plugin activity
- **Settings**: Configure plugin options
- **Uninstall**: Remove plugins cleanly

#### Settings
- **Global preferences**: System-wide plugin settings
- **Security options**: Permission management
- **Update preferences**: Automatic update settings
- **Developer options**: Plugin development tools

## 📦 Available Plugins

### Core Plugins

#### Enhanced Word Count
Get detailed statistics about your writing.

**Features:**
- Word count, character count, and paragraph count
- Reading time estimates (configurable WPM)
- Writing statistics and trends
- Export statistics to CSV

**Settings:**
- **Reading Speed**: Words per minute (default: 200)
- **Show Characters**: Display character count
- **Show Reading Time**: Display estimated reading time

**Usage:**
- **Keyboard shortcut**: `Cmd+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows)
- **Status bar**: Always visible in editor
- **Detailed view**: Click status bar for full statistics

#### Markdown Export
Export your notes to various formats.

**Features:**
- Export to PDF, HTML, DOCX, and plain text
- Batch export multiple notes
- Custom export templates
- Preserve formatting and links

**Settings:**
- **Default Format**: Choose preferred export format
- **Include Metadata**: Export frontmatter data
- **Template**: Custom export template
- **Output Directory**: Where to save exported files

**Usage:**
- **Keyboard shortcut**: `Cmd+E` (Mac) or `Ctrl+E` (Windows)
- **Context menu**: Right-click note for export options
- **Batch export**: Select multiple notes and export together

### Productivity Plugins

#### Daily Notes
Automatically create and manage daily journal entries.

**Features:**
- Auto-create daily notes with custom templates
- Quick navigation to today, yesterday, and tomorrow
- Calendar view of daily notes
- Daily note templates with variables

**Settings:**
- **Template**: Custom template for daily notes (supports date variables)
- **Auto-create**: Automatically create today's note on startup
- **Folder**: Where to store daily notes
- **Naming Pattern**: Date format for note names

**Usage:**
- **Today**: `Cmd+T` (Mac) or `Ctrl+T` (Windows)
- **Yesterday**: `Cmd+Shift+T` (Mac) or `Ctrl+Shift+T` (Windows)
- **Calendar**: Navigate through daily notes visually

#### Table of Contents
Generate and insert table of contents for your notes.

**Features:**
- Automatic TOC generation from headings
- Configurable depth levels
- Auto-update when content changes
- Optional section numbering

**Settings:**
- **Max Depth**: Maximum heading level to include (1-6)
- **Auto-update**: Update TOC when content changes
- **Section Numbers**: Include section numbering
- **Style**: TOC formatting style

**Usage:**
- **Insert TOC**: `Cmd+Shift+O` (Mac) or `Ctrl+Shift+O` (Windows)
- **Update TOC**: Automatic or manual refresh
- **Position**: Insert at cursor position

#### Kanban Board
Convert task lists into interactive kanban boards.

**Features:**
- Convert markdown task lists to kanban boards
- Drag and drop task management
- Customizable column names
- Auto-archive completed tasks

**Settings:**
- **Column Names**: Customize kanban column titles
- **Auto-archive**: Automatically archive completed tasks
- **Default View**: List or kanban view preference
- **Colors**: Customize column and card colors

**Usage:**
- **Toggle View**: `Cmd+K` (Mac) or `Ctrl+K` (Windows)
- **Drag Tasks**: Move tasks between columns
- **Quick Edit**: Double-click tasks to edit

### Utility Plugins

#### Auto Backup
Automatically backup your notes to various destinations.

**Features:**
- Scheduled automatic backups
- Multiple backup destinations (local, cloud)
- Backup versioning and retention
- Manual backup and restore

**Settings:**
- **Backup Provider**: Local, Google Drive, Dropbox, GitHub
- **Backup Interval**: How often to backup (hours)
- **Max Backups**: Number of backups to keep
- **Backup Location**: Where to store backups

**Usage:**
- **Manual Backup**: Trigger immediate backup
- **Restore**: Restore from previous backup
- **Schedule**: Automatic backups based on interval

#### Citations & Bibliography
Manage citations and generate bibliographies.

**Features:**
- Citation management with multiple styles
- Automatic bibliography generation
- Import citations from external sources
- In-text citation support

**Settings:**
- **Citation Style**: APA, MLA, Chicago, Harvard
- **Bibliography Location**: Where to place bibliography
- **Auto-generate**: Automatically update bibliography
- **Citation Database**: External citation sources

**Usage:**
- **Insert Citation**: `Cmd+Shift+C` (Mac) or `Ctrl+Shift+C` (Windows)
- **Manage Sources**: Add and edit citation sources
- **Generate Bibliography**: Create formatted bibliography

### Theming Plugins

#### Advanced Dark Theme
Customize the dark theme with advanced options.

**Features:**
- Custom accent colors
- Adjustable sidebar opacity
- Component-specific theming
- Dynamic CSS injection

**Settings:**
- **Accent Color**: Choose from predefined colors or custom
- **Sidebar Opacity**: Adjust transparency level
- **Font Family**: Custom font selection
- **Component Themes**: Individual component styling

**Usage:**
- **Apply Theme**: Activate in theme settings
- **Customize**: Modify theme parameters
- **Reset**: Return to default theme

## ⚙️ Plugin Management

### Installing Plugins

#### From Plugin Store

1. **Open Plugin Store**: Navigate to the plugin store
2. **Browse Plugins**: Look through available plugins
3. **View Details**: Click plugin for full description
4. **Install**: Click "Install" button
5. **Configure**: Set up plugin settings

#### Manual Installation

1. **Obtain Plugin**: Download plugin manifest file
2. **Open Plugin Manager**: Go to installed plugins section
3. **Install from File**: Click "Install from File" button
4. **Select File**: Choose plugin manifest (.json file)
5. **Configure**: Set up plugin settings

#### Development Installation

1. **Create Plugin**: Develop custom plugin
2. **Load Plugin**: Use developer tools to load
3. **Test**: Verify plugin functionality
4. **Install**: Move to production plugins

### Configuring Plugins

#### Plugin Settings

Each plugin can have customizable settings:

- **General Settings**: Basic plugin configuration
- **Appearance**: Visual customization options
- **Behavior**: Functional behavior settings
- **Permissions**: Access control settings
- **Advanced**: Developer and power user options

#### Global Plugin Settings

System-wide plugin preferences:

- **Auto-update**: Automatically update plugins
- **Security Level**: Permission strictness
- **Developer Mode**: Enable development features
- **Performance**: Resource usage limits
- **Logging**: Plugin activity logging

### Managing Permissions

#### Permission Types

- **File System**: Read/write file access
- **UI Modification**: Change interface elements
- **Network Access**: External API calls
- **Settings Access**: Modify application settings
- **Event Handling**: Listen to system events

#### Security Best Practices

- **Review Permissions**: Check what plugins can access
- **Trusted Sources**: Only install from known developers
- **Regular Updates**: Keep plugins updated
- **Monitor Activity**: Watch for unusual behavior
- **Backup First**: Backup before installing new plugins

## 🛠️ Troubleshooting Plugins

### Common Issues

#### Plugin Won't Install

**Possible Causes:**
- Incompatible plugin version
- Missing dependencies
- Permission restrictions
- Corrupted plugin file

**Solutions:**
- Check plugin compatibility
- Update MarkItUp to latest version
- Review security settings
- Download plugin again

#### Plugin Not Working

**Possible Causes:**
- Plugin disabled
- Configuration errors
- API changes
- Conflicting plugins

**Solutions:**
- Enable plugin in manager
- Reset plugin settings
- Update plugin to latest version
- Disable conflicting plugins

#### Performance Issues

**Possible Causes:**
- Resource-heavy plugins
- Too many active plugins
- Memory leaks
- Inefficient plugin code

**Solutions:**
- Disable unused plugins
- Monitor resource usage
- Update problematic plugins
- Contact plugin developer

### Debugging Plugins

#### Developer Tools

1. **Open Browser Console**: F12 → Console
2. **Check Errors**: Look for plugin-related errors
3. **Monitor Network**: Check API calls
4. **Profile Performance**: Identify bottlenecks

#### Plugin Logs

- **Activity Logs**: Plugin execution history
- **Error Logs**: Plugin errors and warnings
- **Performance Metrics**: Resource usage data
- **Debug Output**: Developer debugging information

## 🔧 Advanced Plugin Usage

### Plugin Combinations

#### Workflow Setups

**Writing Workflow:**
- Enhanced Word Count (statistics)
- Daily Notes (journaling)
- Auto Backup (safety)
- Citations (research)

**Research Workflow:**
- Table of Contents (organization)
- Citations & Bibliography (sources)
- Markdown Export (sharing)
- Kanban Board (task management)

**Team Workflow:**
- Auto Backup (shared backups)
- Advanced Dark Theme (consistency)
- Markdown Export (collaboration)
- Daily Notes (progress tracking)

#### Plugin Interactions

Some plugins work better together:
- **Daily Notes + Table of Contents**: Organized daily entries
- **Kanban Board + Auto Backup**: Task management with safety
- **Citations + Markdown Export**: Research with proper attribution
- **Word Count + Daily Notes**: Writing progress tracking

### Custom Plugin Development

For creating your own plugins, see the [Plugin Development Guide](PLUGIN_DEVELOPMENT.md).

#### Quick Start

1. **Study Examples**: Review existing plugin code
2. **Plugin Template**: Use provided templates
3. **API Documentation**: Learn the plugin API
4. **Test Thoroughly**: Ensure compatibility
5. **Share**: Contribute to community

## 📊 Plugin Analytics

### Usage Statistics

Track how plugins are being used:
- **Activation Frequency**: How often plugins are used
- **Feature Usage**: Which features are most popular
- **Performance Impact**: Resource usage by plugin
- **Error Rates**: Plugin stability metrics

### Performance Monitoring

Monitor plugin performance:
- **Load Time**: How long plugins take to load
- **Memory Usage**: RAM consumption
- **CPU Usage**: Processing requirements
- **Network Activity**: External API calls

## 🔄 Plugin Updates

### Automatic Updates

Configure automatic plugin updates:
- **Update Frequency**: How often to check for updates
- **Auto-install**: Automatically install updates
- **Notification**: Get notified of available updates
- **Rollback**: Ability to revert updates

### Manual Updates

Update plugins manually:
1. **Check for Updates**: Review available updates
2. **Read Changelog**: Understand what's changed
3. **Backup Settings**: Save current configuration
4. **Update Plugin**: Install new version
5. **Test**: Verify everything works correctly

## 🌐 Plugin Community

### Sharing Plugins

- **Plugin Registry**: Central repository of plugins
- **GitHub**: Share plugin source code
- **Documentation**: Create user guides
- **Support**: Help other users

### Getting Help

- **Documentation**: Plugin-specific guides
- **Community Forums**: User discussions
- **GitHub Issues**: Bug reports and feature requests
- **Developer Support**: Contact plugin developers

## 🔮 Future Plugin Features

### Planned Enhancements

- **Plugin Marketplace**: Centralized plugin distribution
- **Visual Plugin Builder**: No-code plugin creation
- **Plugin Analytics**: Detailed usage insights
- **Cross-plugin Communication**: Enhanced plugin interactions
- **Plugin Sandboxing**: Improved security isolation

### Community Requests

Popular feature requests from the community:
- **Calendar Integration**: Sync with external calendars
- **Email Notifications**: Send updates via email
- **Mobile Plugins**: Mobile-specific functionality
- **AI Plugins**: Enhanced AI integration
- **Collaboration Plugins**: Team-specific features

---

**Ready to extend MarkItUp?** Start by exploring the [Plugin Store](/) or learn to create your own with the [Plugin Development Guide](PLUGIN_DEVELOPMENT.md).
