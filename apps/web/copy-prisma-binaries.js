// Script to copy Prisma engine binaries for Vercel deployment
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../../node_modules/.prisma/client');
const dest = path.join(__dirname, '.prisma/client');

console.log('Copying Prisma binaries from:', source);
console.log('To:', dest);

if (!fs.existsSync(source)) {
  console.error('Source Prisma client not found!');
  process.exit(1);
}

// Ensure destination directory exists
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

// Copy all files from source to destination
function copyRecursive(src, dst) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(dstPath)) {
        fs.mkdirSync(dstPath, { recursive: true });
      }
      copyRecursive(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
      console.log('Copied:', entry.name);
    }
  }
}

copyRecursive(source, dest);
console.log('Prisma binaries copied successfully!');
