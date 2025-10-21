#!/bin/bash
# Copy built app bundle to external static site
# Usage: ./scripts/copy-app-bundle.sh <app-name> <target-path>
# Example: ./scripts/copy-app-bundle.sh df-firebase-teaching-app ../my-11ty-site/public/firebase-app

set -e  # Exit on error

if [ $# -lt 2 ]; then
  echo "❌ Error: Two parameters required"
  echo ""
  echo "Usage: $0 <app-name> <target-path>"
  echo ""
  echo "Examples:"
  echo "  $0 df-firebase-teaching-app ../my-11ty-site/public/firebase-app"
  echo "  $0 df-npm-info-app /Users/pete/sites/blog/static/demos/npm-info"
  echo ""
  echo "Available apps:"
  ls -1 apps/ | grep "^df-" | sed 's/^/  - /'
  echo ""
  exit 1
fi

APP_NAME="$1"
TARGET_PATH="$2"
APP_DIR="apps/$APP_NAME"
SOURCE_DIR="$APP_DIR/dist"

# Validate app exists
if [ ! -d "$APP_DIR" ]; then
  echo "❌ Error: App '$APP_NAME' not found"
  echo ""
  echo "Available apps:"
  ls -1 apps/ | grep "^df-" | sed 's/^/  - /'
  exit 1
fi

# Validate app has package.json with build:bundle script
if [ ! -f "$APP_DIR/package.json" ]; then
  echo "❌ Error: $APP_DIR/package.json not found"
  exit 1
fi

if ! grep -q '"build:bundle"' "$APP_DIR/package.json"; then
  echo "❌ Error: App '$APP_NAME' does not have a 'build:bundle' script"
  echo ""
  echo "Add to $APP_DIR/package.json:"
  echo '  "scripts": {'
  echo '    "build:bundle": "vite build --mode production"'
  echo '  }'
  exit 1
fi

# Build fresh bundle
echo "📦 Building fresh bundle for $APP_NAME..."
pnpm --filter "@df/$APP_NAME" build:bundle

# Validate source exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "❌ Error: $SOURCE_DIR not found after build"
  echo "Build may have failed. Check output above."
  exit 1
fi

# Create target directory if needed
mkdir -p "$TARGET_PATH"

# Copy files
echo "📋 Copying to $TARGET_PATH..."
cp -r "$SOURCE_DIR"/* "$TARGET_PATH/"

# Copy example integration file if it exists and update the script hash
EXAMPLE_FILE="$APP_DIR/guides/example-integration.html"
if [ -f "$EXAMPLE_FILE" ]; then
  cp "$EXAMPLE_FILE" "$TARGET_PATH/"

  # Extract the actual script hash from the built index.html
  BUILT_INDEX="$TARGET_PATH/index.html"
  if [ -f "$BUILT_INDEX" ]; then
    ACTUAL_HASH=$(grep -o 'assets/index-[^"]*\.js' "$BUILT_INDEX" | head -1)
    if [ -n "$ACTUAL_HASH" ]; then
      # Update the example-integration.html with the correct hash
      sed -i.bak "s|assets/index-[^\"]*\.js|$ACTUAL_HASH|g" "$TARGET_PATH/example-integration.html"
      rm "$TARGET_PATH/example-integration.html.bak"
      echo "📄 Copied example-integration.html (updated script hash to $ACTUAL_HASH)"
    else
      echo "📄 Copied example-integration.html (warning: could not detect script hash)"
    fi
  else
    echo "📄 Copied example-integration.html"
  fi
fi

# Show what was copied
echo ""
echo "✅ Bundle copied successfully!"
echo ""
echo "Files in target:"
ls -lh "$TARGET_PATH" | tail -n +2 | head -10
echo ""

# Show example integration if it exists
if [ -f "$TARGET_PATH/example-integration.html" ]; then
  echo "📚 Integration example:"
  echo "   Open $TARGET_PATH/example-integration.html to see how to embed"
  echo ""
fi

echo "Next steps:"
echo "1. Review guides/BUNDLE_DEPLOYMENT.md for integration methods"
echo "2. Review $APP_DIR/guides/BUNDLE_INTEGRATION.md for app-specific components"
echo "3. Add components to your site's template/markdown"
echo "4. Deploy your site"
echo "5. Test in browser: check console, try auth/CRUD operations"
