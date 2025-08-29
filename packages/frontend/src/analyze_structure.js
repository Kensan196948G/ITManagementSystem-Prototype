// This file will help analyze the current structure
const fs = require('fs');
const path = require('path');

const srcDir = __dirname;

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        } else {
            arrayOfFiles.push(filePath);
        }
    });

    return arrayOfFiles;
}

const allFiles = getAllFiles(srcDir);
console.log('All files in src directory:');
allFiles.forEach(file => {
    const relativePath = path.relative(srcDir, file);
    console.log(relativePath);
});

module.exports = { getAllFiles };