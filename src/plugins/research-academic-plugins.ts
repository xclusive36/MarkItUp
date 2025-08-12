import { PluginManifest, PluginSetting } from '../lib/types';

// Research & Academic Tools Plugin Collection (Simplified)
// Academic research, citation management, and scholarly writing tools

export const citationManagerPlugin: PluginManifest = {
  id: 'citation-manager-pro',
  name: 'Citation Manager Pro',
  description: 'Manage citations, bibliographies, and academic references',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'citation-manager-pro.js',
  permissions: [
    { type: 'clipboard', description: 'Copy citation data' },
    { type: 'file-system', description: 'Save citation databases' }
  ],
  commands: [
    {
      id: 'add-citation',
      name: 'Add Citation',
      description: 'Add a new citation or reference',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'citationStyle', name: 'Citation Style', type: 'select', default: 'APA', description: 'Default citation style', options: [
      { label: 'APA', value: 'APA' },
      { label: 'MLA', value: 'MLA' }
    ]}
  ] as PluginSetting[]
};

export const researchNotebookPlugin: PluginManifest = {
  id: 'research-notebook',
  name: 'Research Notebook',
  description: 'Structured research documentation and hypothesis tracking',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'research-notebook.js',
  permissions: [
    { type: 'file-system', description: 'Save research notes' }
  ],
  commands: [
    {
      id: 'research-entry',
      name: 'Research Entry',
      description: 'Create structured research entry',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'researchField', name: 'Research Field', type: 'string', default: 'General', description: 'Primary research field' }
  ] as PluginSetting[]
};

export const literatureReviewPlugin: PluginManifest = {
  id: 'literature-review-pro',
  name: 'Literature Review Pro',
  description: 'Systematic literature review and meta-analysis tools',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'literature-review-pro.js',
  permissions: [
    { type: 'file-system', description: 'Save literature reviews' }
  ],
  commands: [
    {
      id: 'review-protocol',
      name: 'Review Protocol',
      description: 'Create systematic review protocol',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'reviewType', name: 'Review Type', type: 'select', default: 'Systematic', description: 'Type of literature review', options: [
      { label: 'Systematic Review', value: 'Systematic' },
      { label: 'Meta-Analysis', value: 'Meta-Analysis' }
    ]}
  ] as PluginSetting[]
};

export const thesisWriterPlugin: PluginManifest = {
  id: 'thesis-writer',
  name: 'Thesis Writer',
  description: 'Academic thesis and dissertation writing assistant',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'thesis-writer.js',
  permissions: [
    { type: 'file-system', description: 'Save thesis chapters' }
  ],
  commands: [
    {
      id: 'thesis-outline',
      name: 'Thesis Outline',
      description: 'Create comprehensive thesis outline',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'thesisType', name: 'Thesis Type', type: 'select', default: 'PhD', description: 'Type of thesis', options: [
      { label: 'PhD Dissertation', value: 'PhD' },
      { label: 'Masters Thesis', value: 'Masters' }
    ]}
  ] as PluginSetting[]
};

export const dataAnalysisPlugin: PluginManifest = {
  id: 'data-analysis-pro',
  name: 'Data Analysis Pro',
  description: 'Statistical analysis and data visualization for research',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'data-analysis-pro.js',
  permissions: [
    { type: 'file-system', description: 'Access data files' }
  ],
  commands: [
    {
      id: 'analysis-plan',
      name: 'Analysis Plan',
      description: 'Create statistical analysis plan',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'software', name: 'Statistical Software', type: 'select', default: 'R', description: 'Preferred statistical software', options: [
      { label: 'R', value: 'R' },
      { label: 'Python', value: 'Python' }
    ]}
  ] as PluginSetting[]
};
