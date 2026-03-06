// Script to copy Prisma engine binaries for Vercel deployment
const fs = require('fs');
const path = require('path');

// Try multiple possible locations for Prisma client in pnpm monorepo
const possibleSources = [
  path.join(__dirname, '../../node_modules/.prisma/client'),
  path.join(__dirname, '../../node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client'),
  path.join(__dirname, '../../node_modules/@prisma/client'),
];

let source = null;
for (const possibleSource of possibleSources) {
  if (fs.existsSync(possibleSource)) {
    source = possibleSource;
    break;
  }
}

const dest = path.join(__dirname, '.prisma/client');

console.log('Copying Prisma binaries from:', source);
console.log('To:', dest);

if (!source) {
  console.error('Source Prisma client not found in any of the expected locations!');
  console.error('Tried:', possibleSources);
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
