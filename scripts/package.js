#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const readmePath = path.join(__dirname, '..', 'README.md');
const readmeBackupPath = path.join(__dirname, '..', 'README.md.backup');

try {
  // Read the original README
  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  // Backup the original README
  fs.writeFileSync(readmeBackupPath, readmeContent);

  // Remove SVG badge lines (VS Code Marketplace doesn't allow SVGs)
  // This keeps the README clean for packaging while preserving badges on GitHub
  readmeContent = readmeContent.replace(
    /\[!\[.*?\]\(.*?\.svg\)\]\(.*?\)\n?/g,
    '',
  );

  // Also remove any remaining SVG image references
  readmeContent = readmeContent.replace(/!\[.*?\]\(.*?\.svg\)\n?/g, '');

  // Write the modified README
  fs.writeFileSync(readmePath, readmeContent);

  console.log('✓ README modified for packaging (SVG badges replaced with PNG)');

  // Run vsce package
  console.log('📦 Packaging extension...');
  execSync('npx vsce package', { stdio: 'inherit' });

  // Restore the original README
  fs.writeFileSync(readmePath, fs.readFileSync(readmeBackupPath, 'utf8'));
  fs.unlinkSync(readmeBackupPath);

  console.log('✓ README restored to original');
  console.log('✅ Packaging complete!');
} catch (error) {
  // Restore README on error
  if (fs.existsSync(readmeBackupPath)) {
    fs.writeFileSync(readmePath, fs.readFileSync(readmeBackupPath, 'utf8'));
    fs.unlinkSync(readmeBackupPath);
    console.log('✓ README restored after error');
  }
  console.error('❌ Error during packaging:', error.message);
  process.exit(1);
}
