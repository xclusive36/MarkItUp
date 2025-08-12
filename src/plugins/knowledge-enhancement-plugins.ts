import { PluginManifest } from '../lib/types';

// Knowledge Graph Plugin - Visualize note relationships
export const knowledgeGraphPlugin: PluginManifest = {
  id: 'knowledge-graph',
  name: 'Knowledge Graph',
  version: '1.0.0',
  description: 'Visualize and navigate relationships between notes in an interactive knowledge graph',
  author: 'MarkItUp Team',
  main: 'knowledge-graph.js',
  
  permissions: [
    {
      type: 'file-system',
      description: 'Analyze note relationships and connections'
    }
  ],

  settings: [
    {
      id: 'graphLayout',
      name: 'Graph Layout',
      type: 'select',
      options: [
        { label: 'Force-directed', value: 'force' },
        { label: 'Hierarchical', value: 'hierarchical' },
        { label: 'Circular', value: 'circular' },
        { label: 'Grid', value: 'grid' }
      ],
      default: 'force',
      description: 'Layout algorithm for the knowledge graph'
    },
    {
      id: 'maxNodes',
      name: 'Maximum Nodes',
      type: 'number',
      default: 100,
      description: 'Maximum number of nodes to display'
    },
    {
      id: 'showOrphans',
      name: 'Show Orphan Notes',
      type: 'boolean',
      default: false,
      description: 'Include notes with no connections'
    }
  ],

  commands: [
    {
      id: 'open-graph',
      name: 'Open Knowledge Graph',
      description: 'Open interactive knowledge graph visualization',
      keybinding: 'Ctrl+Shift+G',
      callback: async () => {
        console.log('Opening knowledge graph');
      }
    },
    {
      id: 'center-current-note',
      name: 'Center Current Note',
      description: 'Center graph on current note',
      callback: async () => {
        console.log('Centering graph on current note');
      }
    },
    {
      id: 'analyze-clusters',
      name: 'Analyze Clusters',
      description: 'Identify and analyze note clusters',
      callback: async () => {
        console.log('Analyzing note clusters');
      }
    }
  ],

  views: [
    {
      id: 'graph-panel',
      name: 'Graph',
      type: 'sidebar',
      icon: '🕸️',
      component: () => {
        return `
          <div class="knowledge-graph">
            <h3>🕸️ Knowledge Graph</h3>
            <div class="graph-mini">
              <svg width="200" height="150">
                <circle cx="100" cy="75" r="8" fill="#3498db" stroke="#2c3e50" stroke-width="2"/>
                <circle cx="60" cy="40" r="6" fill="#e74c3c" stroke="#2c3e50" stroke-width="1"/>
                <circle cx="140" cy="40" r="6" fill="#2ecc71" stroke="#2c3e50" stroke-width="1"/>
                <circle cx="60" cy="110" r="6" fill="#f39c12" stroke="#2c3e50" stroke-width="1"/>
                <circle cx="140" cy="110" r="6" fill="#9b59b6" stroke="#2c3e50" stroke-width="1"/>
                <line x1="100" y1="75" x2="60" y2="40" stroke="#95a5a6" stroke-width="1"/>
                <line x1="100" y1="75" x2="140" y2="40" stroke="#95a5a6" stroke-width="1"/>
                <line x1="100" y1="75" x2="60" y2="110" stroke="#95a5a6" stroke-width="1"/>
                <line x1="100" y1="75" x2="140" y2="110" stroke="#95a5a6" stroke-width="1"/>
              </svg>
            </div>
            <div class="graph-stats">
              <div class="stat-item">
                <span>Nodes: 47</span>
              </div>
              <div class="stat-item">
                <span>Connections: 89</span>
              </div>
              <div class="stat-item">
                <span>Clusters: 5</span>
              </div>
            </div>
            <button onclick="alert('Open full graph')" class="btn btn-primary">Full Graph</button>
          </div>
        `;
      }
    }
  ]
};

// Learning Path Plugin - Create structured learning paths
export const learningPathPlugin: PluginManifest = {
  id: 'learning-path',
  name: 'Learning Path',
  version: '1.0.0',
  description: 'Create and follow structured learning paths through your notes and external resources',
  author: 'MarkItUp Team',
  main: 'learning-path.js',
  
  permissions: [
    {
      type: 'file-system',
      description: 'Manage learning path data and progress'
    }
  ],

  settings: [
    {
      id: 'trackProgress',
      name: 'Track Progress',
      type: 'boolean',
      default: true,
      description: 'Track completion progress for learning paths'
    },
    {
      id: 'estimateTime',
      name: 'Estimate Reading Time',
      type: 'boolean',
      default: true,
      description: 'Estimate time required for each step'
    },
    {
      id: 'notificationReminders',
      name: 'Progress Reminders',
      type: 'boolean',
      default: false,
      description: 'Send reminders to continue learning paths'
    }
  ],

  commands: [
    {
      id: 'create-path',
      name: 'Create Learning Path',
      description: 'Create a new learning path from selected notes',
      callback: async () => {
        const name = prompt('Learning path name:');
        if (name) {
          console.log(`Creating learning path: ${name}`);
        }
      }
    },
    {
      id: 'add-to-path',
      name: 'Add to Learning Path',
      description: 'Add current note to a learning path',
      callback: async () => {
        console.log('Adding note to learning path');
      }
    },
    {
      id: 'view-progress',
      name: 'View Progress',
      description: 'View learning path progress and statistics',
      callback: async () => {
        console.log('Viewing learning progress');
      }
    }
  ],

  views: [
    {
      id: 'learning-panel',
      name: 'Learning',
      type: 'sidebar',
      icon: '🎓',
      component: () => {
        return `
          <div class="learning-path">
            <h3>🎓 Learning Paths</h3>
            <div class="path-list">
              <div class="path-item">
                <div class="path-title">JavaScript Fundamentals</div>
                <div class="path-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 60%"></div>
                  </div>
                  <span class="progress-text">6/10 completed</span>
                </div>
                <button onclick="alert('Continue path')" class="btn-mini">Continue</button>
              </div>
              <div class="path-item">
                <div class="path-title">Data Science Basics</div>
                <div class="path-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 30%"></div>
                  </div>
                  <span class="progress-text">3/10 completed</span>
                </div>
                <button onclick="alert('Continue path')" class="btn-mini">Continue</button>
              </div>
            </div>
            <button onclick="alert('Create new path')" class="btn btn-primary">+ New Path</button>
          </div>
        `;
      }
    }
  ]
};

// Concept Map Plugin - Create visual concept maps
export const conceptMapPlugin: PluginManifest = {
  id: 'concept-map',
  name: 'Concept Map',
  version: '1.0.0',
  description: 'Create visual concept maps to organize and understand complex topics and relationships',
  author: 'MarkItUp Team',
  main: 'concept-map.js',
  
  permissions: [
    {
      type: 'file-system',
      description: 'Store concept map data and images'
    }
  ],

  settings: [
    {
      id: 'autoLayout',
      name: 'Auto Layout',
      type: 'boolean',
      default: true,
      description: 'Automatically arrange concept map elements'
    },
    {
      id: 'mapStyle',
      name: 'Map Style',
      type: 'select',
      options: [
        { label: 'Hierarchical', value: 'hierarchical' },
        { label: 'Network', value: 'network' },
        { label: 'Mind Map', value: 'mindmap' },
        { label: 'Flow Chart', value: 'flowchart' }
      ],
      default: 'mindmap',
      description: 'Default style for new concept maps'
    }
  ],

  commands: [
    {
      id: 'create-concept-map',
      name: 'Create Concept Map',
      description: 'Create a new concept map',
      callback: async () => {
        const topic = prompt('Main topic:');
        if (topic) {
          console.log(`Creating concept map for: ${topic}`);
        }
      }
    },
    {
      id: 'add-concept',
      name: 'Add Concept',
      description: 'Add a new concept to current map',
      callback: async () => {
        console.log('Adding new concept');
      }
    },
    {
      id: 'export-map',
      name: 'Export Map',
      description: 'Export concept map as image or PDF',
      callback: async () => {
        console.log('Exporting concept map');
      }
    }
  ],

  views: [
    {
      id: 'concept-map-panel',
      name: 'Concepts',
      type: 'sidebar',
      icon: '🗺️',
      component: () => {
        return `
          <div class="concept-map">
            <h3>🗺️ Concept Maps</h3>
            <div class="map-list">
              <div class="map-item">
                <div class="map-title">Machine Learning</div>
                <div class="map-meta">15 concepts • 23 connections</div>
                <button onclick="alert('Open map')" class="btn-mini">Open</button>
              </div>
              <div class="map-item">
                <div class="map-title">Project Management</div>
                <div class="map-meta">12 concepts • 18 connections</div>
                <button onclick="alert('Open map')" class="btn-mini">Open</button>
              </div>
            </div>
            <div class="map-tools">
              <button onclick="alert('Add concept')" class="tool-btn">+ Concept</button>
              <button onclick="alert('Add connection')" class="tool-btn">+ Link</button>
            </div>
            <button onclick="alert('Create new map')" class="btn btn-primary">New Map</button>
          </div>
        `;
      }
    }
  ]
};

// Question Bank Plugin - Generate and manage questions
export const questionBankPlugin: PluginManifest = {
  id: 'question-bank',
  name: 'Question Bank',
  version: '1.0.0',
  description: 'Generate study questions from notes and create interactive quizzes for better learning',
  author: 'MarkItUp Team',
  main: 'question-bank.js',
  
  permissions: [
    {
      type: 'file-system',
      description: 'Store questions and quiz data'
    }
  ],

  settings: [
    {
      id: 'questionTypes',
      name: 'Question Types',
      type: 'select',
      options: [
        { label: 'Multiple Choice', value: 'multiple-choice' },
        { label: 'True/False', value: 'true-false' },
        { label: 'Open-ended', value: 'open-ended' },
        { label: 'All Types', value: 'all' }
      ],
      default: 'all',
      description: 'Types of questions to generate'
    },
    {
      id: 'autoGenerate',
      name: 'Auto-generate Questions',
      type: 'boolean',
      default: true,
      description: 'Automatically generate questions from new notes'
    },
    {
      id: 'difficultyLevels',
      name: 'Include Difficulty Levels',
      type: 'boolean',
      default: true,
      description: 'Categorize questions by difficulty'
    }
  ],

  commands: [
    {
      id: 'generate-questions',
      name: 'Generate Questions',
      description: 'Generate questions from current note',
      callback: async () => {
        console.log('Generating questions from current note');
      }
    },
    {
      id: 'create-quiz',
      name: 'Create Quiz',
      description: 'Create a quiz from selected questions',
      callback: async () => {
        console.log('Creating new quiz');
      }
    },
    {
      id: 'take-quiz',
      name: 'Take Quiz',
      description: 'Start an interactive quiz session',
      callback: async () => {
        console.log('Starting quiz session');
      }
    }
  ],

  views: [
    {
      id: 'questions-panel',
      name: 'Questions',
      type: 'sidebar',
      icon: '❓',
      component: () => {
        return `
          <div class="question-bank">
            <h3>❓ Question Bank</h3>
            <div class="question-stats">
              <div class="stat-item">
                <span>Total Questions: 127</span>
              </div>
              <div class="stat-item">
                <span>Quizzes Created: 8</span>
              </div>
              <div class="stat-item">
                <span>Average Score: 85%</span>
              </div>
            </div>
            <div class="recent-questions">
              <h4>Recent Questions</h4>
              <div class="question-item">
                <div class="question-text">What are the key principles of...?</div>
                <div class="question-meta">Multiple Choice • Easy</div>
              </div>
              <div class="question-item">
                <div class="question-text">Explain the difference between...?</div>
                <div class="question-meta">Open-ended • Medium</div>
              </div>
            </div>
            <div class="quiz-actions">
              <button onclick="alert('Generate questions')" class="btn btn-secondary">Generate</button>
              <button onclick="alert('Take quiz')" class="btn btn-primary">Take Quiz</button>
            </div>
          </div>
        `;
      }
    }
  ]
};

// Knowledge Extraction Plugin - Extract key information
export const knowledgeExtractionPlugin: PluginManifest = {
  id: 'knowledge-extraction',
  name: 'Knowledge Extraction',
  version: '1.0.0',
  description: 'Automatically extract key facts, definitions, and insights from your notes',
  author: 'MarkItUp Team',
  main: 'knowledge-extraction.js',
  
  permissions: [
    {
      type: 'file-system',
      description: 'Analyze notes and extract knowledge'
    },
    {
      type: 'clipboard',
      description: 'Copy extracted information'
    }
  ],

  settings: [
    {
      id: 'extractionMode',
      name: 'Extraction Mode',
      type: 'select',
      options: [
        { label: 'Key Facts', value: 'facts' },
        { label: 'Definitions', value: 'definitions' },
        { label: 'Insights', value: 'insights' },
        { label: 'All Types', value: 'all' }
      ],
      default: 'all',
      description: 'What type of information to extract'
    },
    {
      id: 'confidenceThreshold',
      name: 'Confidence Threshold',
      type: 'select',
      options: [
        { label: 'High (90%+)', value: 'high' },
        { label: 'Medium (70%+)', value: 'medium' },
        { label: 'Low (50%+)', value: 'low' }
      ],
      default: 'medium',
      description: 'Minimum confidence for extracted information'
    }
  ],

  commands: [
    {
      id: 'extract-knowledge',
      name: 'Extract Knowledge',
      description: 'Extract key information from current note',
      callback: async () => {
        console.log('Extracting knowledge from current note');
      }
    },
    {
      id: 'create-summary',
      name: 'Create Summary',
      description: 'Create summary from extracted knowledge',
      callback: async () => {
        console.log('Creating knowledge summary');
      }
    },
    {
      id: 'export-extracted',
      name: 'Export Extracted Data',
      description: 'Export extracted information as structured data',
      callback: async () => {
        console.log('Exporting extracted knowledge');
      }
    }
  ],

  views: [
    {
      id: 'extraction-panel',
      name: 'Extract',
      type: 'sidebar',
      icon: '⚡',
      component: () => {
        return `
          <div class="knowledge-extraction">
            <h3>⚡ Knowledge Extraction</h3>
            <div class="extraction-results">
              <div class="extract-category">
                <h4>📍 Key Facts</h4>
                <div class="extract-item">
                  <span>JavaScript was created in 1995</span>
                  <span class="confidence">95%</span>
                </div>
                <div class="extract-item">
                  <span>React was developed by Facebook</span>
                  <span class="confidence">98%</span>
                </div>
              </div>
              <div class="extract-category">
                <h4>📚 Definitions</h4>
                <div class="extract-item">
                  <span>API: Application Programming Interface</span>
                  <span class="confidence">90%</span>
                </div>
              </div>
              <div class="extract-category">
                <h4>💡 Insights</h4>
                <div class="extract-item">
                  <span>Performance optimization is crucial for user experience</span>
                  <span class="confidence">85%</span>
                </div>
              </div>
            </div>
            <button onclick="alert('Extract from current note')" class="btn btn-primary">Extract</button>
          </div>
        `;
      }
    }
  ]
};
