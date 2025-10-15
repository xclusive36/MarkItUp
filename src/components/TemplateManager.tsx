'use client';

import React, { useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  template: string;
}

interface TemplateManagerProps {
  builtInTemplates: Template[];
  customTemplates: Template[];
  activeTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onCreateTemplate: (name: string, description: string, template: string) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export default function TemplateManager({
  builtInTemplates,
  customTemplates,
  activeTemplateId,
  onSelectTemplate,
  onCreateTemplate,
  onDeleteTemplate,
}: TemplateManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const handleCreate = () => {
    if (newTemplateName.trim() && newTemplateContent.trim()) {
      onCreateTemplate(newTemplateName, newTemplateDesc, newTemplateContent);
      setIsCreating(false);
      setNewTemplateName('');
      setNewTemplateDesc('');
      setNewTemplateContent('');
    }
  };

  const renderTemplateCard = (template: Template, isCustom: boolean = false) => {
    const isActive = template.id === activeTemplateId;

    return (
      <div
        key={template.id}
        className={`
          relative border rounded-lg p-4 transition-all cursor-pointer
          ${
            isActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 ring-2 ring-blue-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
          }
        `}
        onClick={() => onSelectTemplate(template.id)}
      >
        {/* Active Badge */}
        {isActive && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
              Active
            </span>
          </div>
        )}

        {/* Custom Badge */}
        {isCustom && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full font-medium">
              Custom
            </span>
          </div>
        )}

        <div className={isActive || isCustom ? 'mt-6' : ''}>
          <h3 className="font-semibold text-lg dark:text-white mb-1">{template.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>

          <div className="flex gap-2">
            <button
              onClick={e => {
                e.stopPropagation();
                setPreviewTemplate(template);
              }}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              Preview
            </button>

            {isCustom && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  if (confirm(`Delete template "${template.name}"?`)) {
                    onDeleteTemplate(template.id);
                  }
                }}
                className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="template-manager bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold dark:text-white mb-2">📝 Template Manager</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a template for your daily notes or create your own
        </p>
      </div>

      {/* Built-in Templates */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Built-in Templates</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {builtInTemplates.length} templates
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {builtInTemplates.map(template => renderTemplateCard(template))}
        </div>
      </div>

      {/* Custom Templates */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Custom Templates</h3>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm font-medium"
          >
            + Create Template
          </button>
        </div>

        {customTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTemplates.map(template => renderTemplateCard(template, true))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-2">No custom templates yet</p>
            <button
              onClick={() => setIsCreating(true)}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              Create your first template →
            </button>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsCreating(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Create Custom Template</h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-white hover:text-gray-200 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-white mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={e => setNewTemplateName(e.target.value)}
                  placeholder="My Custom Template"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newTemplateDesc}
                  onChange={e => setNewTemplateDesc(e.target.value)}
                  placeholder="Brief description of this template"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-2">
                  Template Content
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Available variables: {'{'}
                  {'{'} date {'}'}
                  {'}'}, {'{'}
                  {'{'} time {'}'}
                  {'}'}, {'{'}
                  {'{'} day {'}'}
                  {'}'}, {'{'}
                  {'{'} month {'}'}
                  {'}'}, {'{'}
                  {'{'} year {'}'}
                  {'}'}
                </p>
                <textarea
                  value={newTemplateContent}
                  onChange={e => setNewTemplateContent(e.target.value)}
                  placeholder="# {{date}}&#10;&#10;## My Section&#10;&#10;Content here..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  rows={12}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newTemplateName.trim() || !newTemplateContent.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setPreviewTemplate(null)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{previewTemplate.name}</h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-white hover:text-gray-200 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                {previewTemplate.template}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Template Tips</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>
            • Use variables like {'{'}
            {'{'} date {'}'}
            {'}'} to insert dynamic content
          </li>
          <li>• Create different templates for different purposes (work, personal, etc.)</li>
          <li>• Templates are applied when creating new daily notes</li>
          <li>• You can switch templates anytime - it won&apos;t affect existing notes</li>
        </ul>
      </div>
    </div>
  );
}
