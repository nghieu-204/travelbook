const fs = require('fs');

['frontend/src/app/admin/tours/create/page.tsx', 'frontend/src/app/admin/tours/edit/[id]/page.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Find backslash backtick and replace with backtick
  code = code.replace(/\\`/g, '`');
  
  // Find backslash dollar and replace with dollar
  code = code.replace(/\\\$/g, '$');

  fs.writeFileSync(file, code);
});
