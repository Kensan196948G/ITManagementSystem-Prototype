// Remove temporary files
const fs = require('fs');
const path = require('path');

const filesToRemove = [
  'test_read.txt',
  'analyze_structure.js',
  'file_checker.py',
  'README_ANALYSIS.md',
  'App_backup.js',
  'cleanup_temp.js'
];

filesToRemove.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    console.log(`Removed: ${file}`);
  }
});

console.log('Cleanup complete');