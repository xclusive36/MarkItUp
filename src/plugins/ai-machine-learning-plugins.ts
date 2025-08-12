import { PluginManifest, PluginSetting } from '../lib/types';

// AI & Machine Learning Tools Plugin Collection
// Artificial intelligence, machine learning, and automation tools

export const aiWritingAssistantPlugin: PluginManifest = {
  id: 'ai-writing-assistant',
  name: 'AI Writing Assistant',
  description: 'Advanced AI-powered writing assistance and content generation',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'ai-writing-assistant.js',
  permissions: [
    { type: 'network', description: 'Connect to AI services' },
    { type: 'clipboard', description: 'Handle AI-generated content' }
  ],
  commands: [
    {
      id: 'ai-generate',
      name: 'AI Generate',
      description: 'Generate content using AI',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'aiModel', name: 'AI Model', type: 'select', default: 'GPT-4', description: 'AI model selection', options: [
      { label: 'GPT-4', value: 'GPT-4' },
      { label: 'GPT-3.5', value: 'GPT-3.5' },
      { label: 'Claude', value: 'Claude' }
    ]}
  ] as PluginSetting[]
};

export const mlClassifierPlugin: PluginManifest = {
  id: 'ml-classifier',
  name: 'ML Classifier',
  description: 'Machine learning content classification and categorization',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'ml-classifier.js',
  permissions: [
    { type: 'file-system', description: 'Train and save ML models' },
    { type: 'network', description: 'Access ML training services' }
  ],
  commands: [
    {
      id: 'classify-content',
      name: 'Classify Content',
      description: 'Automatically classify content using ML',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'classificationModel', name: 'Classification Model', type: 'select', default: 'Custom', description: 'ML classification model', options: [
      { label: 'Custom', value: 'Custom' },
      { label: 'Pre-trained', value: 'Pre-trained' }
    ]}
  ] as PluginSetting[]
};

export const neuralSearchPlugin: PluginManifest = {
  id: 'neural-search',
  name: 'Neural Search',
  description: 'AI-powered semantic search and content discovery',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'neural-search.js',
  permissions: [
    { type: 'network', description: 'Access neural search APIs' },
    { type: 'file-system', description: 'Cache search embeddings' }
  ],
  commands: [
    {
      id: 'neural-search',
      name: 'Neural Search',
      description: 'Perform semantic search using neural networks',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'embeddingModel', name: 'Embedding Model', type: 'select', default: 'OpenAI', description: 'Neural embedding model', options: [
      { label: 'OpenAI', value: 'OpenAI' },
      { label: 'Sentence-BERT', value: 'Sentence-BERT' }
    ]}
  ] as PluginSetting[]
};

export const autoSummarizerPlugin: PluginManifest = {
  id: 'auto-summarizer',
  name: 'Auto Summarizer',
  description: 'AI-powered automatic content summarization',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'auto-summarizer.js',
  permissions: [
    { type: 'network', description: 'Access summarization APIs' },
    { type: 'file-system', description: 'Save summary models' }
  ],
  commands: [
    {
      id: 'auto-summarize',
      name: 'Auto Summarize',
      description: 'Generate automatic summaries',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'summaryLength', name: 'Summary Length', type: 'select', default: 'Medium', description: 'Default summary length', options: [
      { label: 'Short', value: 'Short' },
      { label: 'Medium', value: 'Medium' },
      { label: 'Long', value: 'Long' }
    ]}
  ] as PluginSetting[]
};

export const chatbotIntegrationPlugin: PluginManifest = {
  id: 'chatbot-integration',
  name: 'Chatbot Integration',
  description: 'Integrate AI chatbots for interactive assistance',
  version: '1.0.0',
  author: 'MarkItUp Team',
  main: 'chatbot-integration.js',
  permissions: [
    { type: 'network', description: 'Connect to chatbot services' }
  ],
  commands: [
    {
      id: 'chat-with-ai',
      name: 'Chat with AI',
      description: 'Start AI chat session',
      callback: () => {}
    }
  ],
  settings: [
    { id: 'chatProvider', name: 'Chat Provider', type: 'select', default: 'OpenAI', description: 'AI chat service provider', options: [
      { label: 'OpenAI', value: 'OpenAI' },
      { label: 'Anthropic', value: 'Anthropic' },
      { label: 'Custom', value: 'Custom' }
    ]}
  ] as PluginSetting[]
};
