const fs = require('fs');
const path = require('path');

// Files to copy from public to build directory
const filesToCopy = [
  '_redirects',
  'vercel.json',
  'netlify.toml',
  '.htaccess',
  'staticwebapp.config.json'
];

// Files to copy from root to build directory
const rootFilesToCopy = [
  'render.yaml'
];

// Copy files from public directory
filesToCopy.forEach(file => {
  const sourcePath = path.join(__dirname, 'public', file);
  const destPath = path.join(__dirname, 'build', file);
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${file} to build directory`);
    } catch (error) {
      console.error(`❌ Error copying ${file}:`, error.message);
    }
  } else {
    console.log(`⚠️  ${file} not found in public directory`);
  }
});

// Copy files from root directory
rootFilesToCopy.forEach(file => {
  const sourcePath = path.join(__dirname, file);
  const destPath = path.join(__dirname, 'build', file);
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${file} to build directory`);
    } catch (error) {
      console.error(`❌ Error copying ${file}:`, error.message);
    }
  } else {
    console.log(`⚠️  ${file} not found in root directory`);
  }
});

console.log('🎯 Configuration files copy completed!');