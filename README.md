# MarkItUp - Markdown Editor

A powerful, modern markdown editor built with Next.js, featuring live preview, file management, and both light and dark mode support.

## ✨ Features

### 📝 **Markdown Editing**
- Real-time markdown editor with syntax highlighting
- Live preview with GitHub Flavored Markdown (GFM) support
- Split-view interface (edit/preview toggle)
- Monospace font for optimal code editing experience

### 🎨 **Theme Support**
- **Light Mode**: Clean, bright interface perfect for daytime use
- **Dark Mode**: Eye-friendly dark theme for low-light environments
- **Auto Detection**: Respects system theme preference on first visit
- **Persistent**: Theme choice saved in localStorage
- **Smooth Transitions**: Animated theme switching

### 💾 **File Management**
- Save markdown files to server (`/markdown` directory)
- Load existing files from server
- Delete files with one-click
- Auto-generated `.md` file extensions
- File list sidebar with creation timestamps

### 🔧 **Technical Features**
- **SSR Safe**: Proper hydration handling for Next.js 15
- **TypeScript**: Fully typed for better development experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Code Highlighting**: Syntax highlighting for code blocks in both themes
- **Accessibility**: ARIA labels and keyboard navigation support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd markitup
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Screenshot

![Screenshot](./ss.png)

## 🎯 Usage

### Writing Markdown
1. Click in the editor area to start writing
2. Use standard Markdown syntax for formatting
3. Toggle between "Edit" and "Preview" modes using the button in the header

### Theme Switching
- Click the theme toggle button (🌙/☀️) in the header
- The theme will switch instantly and be saved for future visits
- The syntax highlighting in code blocks adapts to the selected theme

### File Operations
1. **Save**: Enter a filename and click "Save" to store your markdown
2. **Load**: Click on any file in the "Saved Files" list to load it
3. **Delete**: Click the "×" button next to a file to delete it

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Typography plugin
- **Markdown**: react-markdown with remark-gfm and rehype-highlight
- **Theme**: Custom React Context with localStorage persistence
- **File Storage**: Node.js filesystem API

## 📁 Project Structure

```
markitup/
├── src/
│   ├── app/
│   │   ├── api/files/           # File management API routes
│   │   ├── highlight.css        # Custom syntax highlighting styles
│   │   ├── page.tsx             # Main application component
│   │   └── layout.tsx           # Root layout with ThemeProvider
│   ├── components/
│   │   └── ThemeToggle.tsx      # Theme switcher component
│   └── contexts/
│       └── ThemeContext.tsx     # Theme management context
├── markdown/                    # Server-side markdown file storage
├── tailwind.config.js          # Tailwind configuration
└── package.json
```

## 🎨 Theme Implementation

The application uses a custom theme system built with React Context:

- **ThemeProvider**: Manages theme state and localStorage persistence
- **useTheme Hook**: Provides theme access throughout the app
- **CSS Classes**: Tailwind's `dark:` prefix for theme-specific styles
- **Syntax Highlighting**: Custom CSS for code block theming

## 📱 Responsive Design

- **Desktop**: Full sidebar with file management
- **Tablet**: Collapsible sidebar layout
- **Mobile**: Stack layout with touch-friendly controls

## 🔒 Security Features

- Server-side file validation
- Path traversal protection
- Input sanitization
- CORS protection

## 🚀 Deployment

The application can be deployed on any platform that supports Next.js:

### Vercel (Recommended)
```bash
npx vercel --prod
```

### Docker
```bash
docker build -t markitup .
docker run -p 3000:3000 markitup
```

### Self-hosted
```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

MIT License - see LICENSE file for details.
