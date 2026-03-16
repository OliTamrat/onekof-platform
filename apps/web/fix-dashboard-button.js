const fs = require('fs');
const filePath = './src/app/dashboard/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Replace the button opening tag
content = content.replace(
  /(<div className="lg:col-span-2">\s+)<button(\s+onClick={handleShowAllStatusOverview})/s,
  '$1<div$2'
);

// Replace the button closing tag  
content = content.replace(
  /(<\/div>\s+)<\/button>(\s+<\/div>\s+<\/div>\s+{\/\* Right Sidebar \*\/})/s,
  '$1</div>$2'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed dashboard button nesting');
