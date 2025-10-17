# Pre-commit Hooks Setup Guide

## 🎯 What Are Pre-commit Hooks?

Pre-commit hooks are **automated scripts** that run **before each git commit** to:

- ✅ **Automatically fix** code formatting and style issues
- ✅ **Catch errors early** before they enter your repository  
- ✅ **Enforce consistent** code quality standards
- ✅ **Save time** by preventing back-and-forth code review cycles
- ✅ **Block problematic commits** that would break the build

## 🔧 What We Just Set Up

### 1. **Husky** - Git Hook Manager
- Manages git hooks in a developer-friendly way
- Automatically runs checks before commits
- Easy to configure and share with your team

### 2. **lint-staged** - Efficient Linting
- Only runs linters on **staged files** (files you're about to commit)
- Much faster than running linters on entire codebase
- Prevents fixing unrelated files in your commit

### 3. **Prettier** - Code Formatting
- Automatically formats your code consistently
- Handles indentation, semicolons, quotes, line length, etc.
- Works with TypeScript, JavaScript, JSON, CSS, and Markdown

### 4. **ESLint with --fix** - Code Quality
- Automatically fixes many linting issues
- Removes unused imports and variables
- Fixes simple TypeScript and React issues

## 🚀 How It Works

```bash
# When you run: git commit -m "Your message"

1. Husky intercepts the commit
2. lint-staged runs on staged files:
   - ESLint fixes code quality issues
   - Prettier formats the code
3. If successful → commit proceeds
4. If errors found → commit is blocked
```

## 📁 Files Created

```
.husky/
  └── pre-commit          # The actual git hook script

.prettierrc               # Prettier configuration
.prettierignore          # Files Prettier should ignore

package.json             # Updated with new scripts and lint-staged config
```

## 🎮 Available Scripts

```bash
# Manual commands (same as what pre-commit runs):
npm run lint:fix         # Fix ESLint issues
npm run format          # Format all files with Prettier
npm run format:check    # Check if files are formatted
npm run type-check      # Check TypeScript types
```

## 🌟 Benefits for MarkItUp

### Before Pre-commit Hooks:
```bash
git commit -m "Add new feature"
# ❌ Commit includes unused imports
# ❌ Inconsistent formatting
# ❌ Linting warnings in CI/CD
# ❌ Manual cleanup needed later
```

### After Pre-commit Hooks:
```bash
git commit -m "Add new feature"
# ✅ Unused imports automatically removed
# ✅ Code automatically formatted
# ✅ Simple linting issues fixed
# ✅ Clean, consistent commits
```

## 🛡️ What Gets Automatically Fixed

### ESLint Auto-fixes:
- ✅ Remove unused imports
- ✅ Remove unused variables (when safe)
- ✅ Fix import ordering
- ✅ Add missing semicolons
- ✅ Fix simple syntax issues

### Prettier Auto-formats:
- ✅ Consistent indentation (2 spaces)
- ✅ Single quotes for strings
- ✅ Trailing commas where appropriate
- ✅ Line length limits (100 characters)
- ✅ Consistent bracket spacing

## ⚠️ What Still Needs Manual Attention

Some issues require human decision-making:
- Complex TypeScript type issues
- useEffect dependency arrays (functionality impact)
- Logic errors and bugs
- API design decisions

## 🔄 Testing Your Setup

1. **Make a small change** to any TypeScript file
2. **Add some extra spaces** or remove semicolons
3. **Stage and commit**:
   ```bash
   git add .
   git commit -m "Test pre-commit hooks"
   ```
4. **Watch the magic** - your code gets auto-fixed before committing!

## 🎛️ Configuration

You can customize the behavior by editing:

- **`.prettierrc`** - Code formatting rules
- **`package.json`** lint-staged section - What runs on which files
- **`.husky/pre-commit`** - What commands run before commits

## 🚨 Troubleshooting

If pre-commit hooks fail:
```bash
# Skip hooks for emergency commits (use sparingly):
git commit -m "Emergency fix" --no-verify

# Fix issues manually then commit normally:
npm run lint:fix
npm run format
git add .
git commit -m "Fixed and formatted"
```

## 🎯 Result

Your MarkItUp project now has **professional-grade code quality automation** that will:
- Prevent the linting issues we just fixed from coming back
- Keep your codebase consistently formatted
- Catch issues before they reach your repository
- Save hours of manual cleanup time

This is the same setup used by major open-source projects and professional development teams! 🎉
