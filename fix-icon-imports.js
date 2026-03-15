const fs = require('fs');
const path = require('path');

// Fix ListIcon -> List in automation files
const automationFiles = [
  'apps/web/src/app/dashboard/automations/board/page.tsx',
  'apps/web/src/app/dashboard/automations/code/page.tsx',
  'apps/web/src/app/dashboard/automations/forms/page.tsx',
  'apps/web/src/app/dashboard/automations/list/page.tsx',
  'apps/web/src/app/dashboard/automations/pages/page.tsx',
  'apps/web/src/app/dashboard/automations/timeline/page.tsx',
  'apps/web/src/app/dashboard/automations/summary/page.tsx',
  'apps/web/src/app/dashboard/automations/page.tsx',
  'apps/web/src/app/dashboard/automations/templates/page.tsx',
];

// Fix FolderIcon -> Folder in projects/pages
const projectsFile = 'apps/web/src/app/dashboard/projects/pages/page.tsx';

console.log('Fixing icon imports...');

// Fix ListIcon
automationFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const before = content;
    content = content.replace(/ListIcon/g, 'List');
    if (content !== before) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed ListIcon -> List in ${file}`);
    }
  } else {
    console.log(`✗ File not found: ${file}`);
  }
});

// Fix FolderIcon
const projectsPath = path.join(__dirname, projectsFile);
if (fs.existsSync(projectsPath)) {
  let content = fs.readFileSync(projectsPath, 'utf8');
  const before = content;
  content = content.replace(/FolderIcon/g, 'Folder');
  if (content !== before) {
    fs.writeFileSync(projectsPath, content, 'utf8');
    console.log(`✓ Fixed FolderIcon -> Folder in ${projectsFile}`);
  }
} else {
  console.log(`✗ File not found: ${projectsFile}`);
}

console.log('\nIcon fixes complete!');
