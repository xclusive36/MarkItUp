/**
 * Integration tests for file API with security enhancements
 */

import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api';

test.describe('File API Security', () => {
  // Add a small delay between tests to avoid rate limiting
  test.beforeEach(async () => {
    // Wait a bit to avoid hitting rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  test('should enforce rate limiting on file list endpoint', async ({ request }) => {
    // Make many requests quickly
    const requests = Array.from({ length: 110 }, () => request.get(`${API_BASE}/files`));

    const responses = await Promise.all(requests);

    // Some should be rate limited (429)
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);

    // Check rate limit headers
    const limitedResponse = rateLimited[0];
    expect(limitedResponse.headers()['x-ratelimit-reset']).toBeDefined();
  });

  test('should reject path traversal attempts in filename', async ({ request }) => {
    const response = await request.post(`${API_BASE}/files`, {
      data: {
        filename: '../../../etc/passwd',
        content: 'malicious content',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Invalid filename');
  });

  test('should reject files with dangerous characters', async ({ request }) => {
    const dangerousNames = ['test<file>.md', 'test|file.md', 'test?file.md', 'test*file.md'];

    for (const filename of dangerousNames) {
      const response = await request.post(`${API_BASE}/files`, {
        data: {
          filename,
          content: 'test content',
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Invalid filename');
    }
  });

  test('should reject files over size limit', async ({ request }) => {
    // Create content larger than 10MB (using a realistic size that Next.js will accept)
    // We'll create a 10.5MB file
    const largeContent = 'a'.repeat(10.5 * 1024 * 1024);

    const response = await request.post(`${API_BASE}/files`, {
      data: {
        filename: 'large-file.md',
        content: largeContent,
      },
    });

    // Should be rejected with 413 Payload Too Large
    expect([413, 400]).toContain(response.status());
    if (response.status() === 413 || response.status() === 400) {
      const body = await response.json();
      expect(body.error || body.message || '').toMatch(/too large|size|limit|exceeded/i);
    }
  });

  test('should sanitize XSS attempts in content', async ({ request }) => {
    const testId = Date.now();
    const filename = `test-xss-${testId}.md`;
    const maliciousContent = `
# Test Note

<script>alert('xss')</script>

[Click me](javascript:alert('xss'))
    `;

    const response = await request.post(`${API_BASE}/files`, {
      data: {
        filename,
        content: maliciousContent,
      },
    });

    expect(response.status()).toBe(200);

    // Read the file back
    const readResponse = await request.get(`${API_BASE}/files/${filename}`);
    expect(readResponse.status()).toBe(200);
    const note = await readResponse.json();

    // Content should be sanitized
    expect(note.content).not.toContain('<script>');
    expect(note.content).not.toContain('javascript:');

    // Clean up
    await request.delete(`${API_BASE}/files/${filename}`);
  });

  test('should add .md extension if missing', async ({ request }) => {
    const testId = Date.now();
    const response = await request.post(`${API_BASE}/files`, {
      data: {
        filename: `test-no-extension-${testId}`,
        content: '# Test',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.fileName).toContain('.md');

    // Clean up
    if (body.fileName) {
      await request.delete(`${API_BASE}/files/${body.fileName}`);
    }
  });

  test('should include rate limit headers in responses', async ({ request }) => {
    const response = await request.get(`${API_BASE}/files?limit=10`);

    expect(response.headers()['x-ratelimit-limit']).toBeDefined();
    expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
    expect(response.headers()['x-ratelimit-reset']).toBeDefined();
  });

  test('should handle folder paths securely', async ({ request }) => {
    const testId = Date.now();
    const maliciousPaths = ['../etc', '../../', '/absolute/path'];

    for (const folder of maliciousPaths) {
      const response = await request.post(`${API_BASE}/files`, {
        data: {
          filename: `test-${testId}.md`,
          content: 'test',
          folder,
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Invalid folder path');

      // Small delay between malicious path attempts
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  });

  test('should allow valid subdirectory creation', async ({ request }) => {
    const testId = Date.now();
    const filename = `test-subdir-${testId}.md`;

    const response = await request.post(`${API_BASE}/files`, {
      data: {
        filename,
        content: '# Test Subdirectory',
        folder: 'test-folder/subfolder',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.folder).toBe('test-folder/subfolder');

    // Clean up
    await request.delete(`${API_BASE}/files/test-folder/subfolder/${filename}`);
  });
});

test.describe('Health Check Endpoint', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    expect(response.status()).toBe(200);

    const health = await response.json();
    expect(health.status).toMatch(/healthy|degraded/);
    expect(health.checks.filesystem.status).toBe('pass');
    expect(health.uptime).toBeGreaterThan(0);
  });

  test('should include version information', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    const health = await response.json();

    expect(health.version).toBeDefined();
    expect(health.environment).toBeDefined();
    expect(health.timestamp).toBeDefined();
  });

  test('should include check response times', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    const health = await response.json();

    expect(health.checks.filesystem.responseTime).toBeGreaterThanOrEqual(0);
    expect(health.responseTime).toBeGreaterThanOrEqual(0);
  });
});
