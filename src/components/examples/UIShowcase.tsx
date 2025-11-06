/**
 * UI Component Examples
 * Demonstrates how to use the new design system components
 */

import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Save, Download, Trash2, Sparkles, Check } from 'lucide-react';

/**
 * Button Examples
 */
export function ButtonExamples() {
  return (
    <div className="space-y-8 p-6">
      <section>
        <h3 className="text-lg font-semibold mb-4">Button Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="success">Success Button</Button>
          <Button variant="danger">Danger Button</Button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Button Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="md">
            Medium
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Buttons with Icons</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" icon={Save} iconPosition="left">
            Save Note
          </Button>
          <Button variant="secondary" icon={Download} iconPosition="left">
            Export
          </Button>
          <Button variant="danger" icon={Trash2} iconPosition="left">
            Delete
          </Button>
          <Button variant="success" icon={Check} iconPosition="right">
            Complete
          </Button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Button States</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" isLoading>
            Loading...
          </Button>
          <Button variant="primary" fullWidth>
            Full Width Button
          </Button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Icon-Only Buttons</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" icon={Save} aria-label="Save">
            <span className="sr-only">Save</span>
          </Button>
          <Button variant="ghost" icon={Download} aria-label="Download">
            <span className="sr-only">Download</span>
          </Button>
          <Button variant="ghost" icon={Trash2} aria-label="Delete">
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </section>
    </div>
  );
}

/**
 * Card Examples
 */
export function CardExamples() {
  return (
    <div className="space-y-8 p-6">
      <section>
        <h3 className="text-lg font-semibold mb-4">Card Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="default" padding="md">
            <h4 className="font-semibold mb-2">Default Card</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Standard card with subtle shadow and border.
            </p>
          </Card>

          <Card variant="elevated" padding="md">
            <h4 className="font-semibold mb-2">Elevated Card</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Card with more prominent shadow for emphasis.
            </p>
          </Card>

          <Card variant="bordered" padding="md">
            <h4 className="font-semibold mb-2">Bordered Card</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Simple card with just a border, no shadow.
            </p>
          </Card>

          <Card variant="interactive" padding="md">
            <h4 className="font-semibold mb-2">Interactive Card</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Clickable card with hover effects.
            </p>
          </Card>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Card Padding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="default" padding="sm">
            <p className="text-sm">Small Padding</p>
          </Card>

          <Card variant="default" padding="md">
            <p className="text-sm">Medium Padding</p>
          </Card>

          <Card variant="default" padding="lg">
            <p className="text-sm">Large Padding</p>
          </Card>

          <Card variant="default" padding="none">
            <div className="p-4 bg-[var(--bg-tertiary)]">
              <p className="text-sm">Custom Padding (none + manual)</p>
            </div>
          </Card>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Complex Card Layout</h3>
        <Card variant="elevated" padding="none">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-lg mb-1">Note Title</h4>
                <p className="text-sm text-[var(--text-secondary)]">Last edited 2 hours ago</p>
              </div>
              <Button variant="ghost" size="sm" icon={Sparkles}>
                AI Assist
              </Button>
            </div>

            <div className="prose prose-sm mb-4">
              <p>
                This is a complex card layout demonstrating how to combine the Card component with
                other UI elements. The card has custom padding controls and nested content.
              </p>
            </div>

            <div
              className="flex gap-2 pt-4"
              style={{ borderTop: '1px solid var(--border-primary)' }}
            >
              <Button variant="primary" size="sm" icon={Save}>
                Save
              </Button>
              <Button variant="secondary" size="sm" icon={Download}>
                Export
              </Button>
              <Button variant="ghost" size="sm" icon={Trash2}>
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

/**
 * Design Token Examples
 */
export function DesignTokenExamples() {
  return (
    <div className="space-y-8 p-6">
      <section>
        <h3 className="text-lg font-semibold mb-4">Spacing Scale</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map(size => (
            <div key={size} className="flex items-center gap-4">
              <div className="w-24 text-sm">--space-{size}</div>
              <div
                style={{
                  width: `var(--space-${size})`,
                  height: '1rem',
                  backgroundColor: 'var(--accent-primary)',
                  borderRadius: 'var(--radius-sm)',
                }}
              />
              <div className="text-xs text-[var(--text-secondary)]">
                {size * 0.25}rem ({size * 4}px)
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Color Tokens</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Primary', var: '--accent-primary' },
            { name: 'Success', var: '--color-success' },
            { name: 'Warning', var: '--color-warning' },
            { name: 'Error', var: '--color-error' },
            { name: 'Info', var: '--color-info' },
          ].map(({ name, var: varName }) => (
            <div key={name}>
              <div
                style={{
                  backgroundColor: `var(${varName})`,
                  height: '4rem',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-2)',
                }}
              />
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs text-[var(--text-secondary)]">{varName}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Shadow Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map(size => (
            <div key={size}>
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: 'var(--space-8)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: `var(--shadow-${size})`,
                  marginBottom: 'var(--space-2)',
                }}
              >
                <div className="h-12" />
              </div>
              <div className="text-sm font-medium text-center">shadow-{size}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Border Radius Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['sm', 'md', 'lg', 'xl', '2xl', 'full'].map(size => (
            <div key={size}>
              <div
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  height: '4rem',
                  borderRadius: `var(--radius-${size})`,
                  marginBottom: 'var(--space-2)',
                }}
              />
              <div className="text-sm font-medium text-center">radius-{size}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Complete Demo Page
 */
export default function UIComponentShowcase() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">UI Component Showcase</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Design System Components and Tokens
          </p>
        </div>

        <div className="space-y-12">
          <Card variant="elevated" padding="none">
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-2xl font-bold">Buttons</h2>
            </div>
            <ButtonExamples />
          </Card>

          <Card variant="elevated" padding="none">
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-2xl font-bold">Cards</h2>
            </div>
            <CardExamples />
          </Card>

          <Card variant="elevated" padding="none">
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-2xl font-bold">Design Tokens</h2>
            </div>
            <DesignTokenExamples />
          </Card>
        </div>
      </div>
    </div>
  );
}
