const fs = require('fs');
const v2Code = fs.readFileSync('backend/controllers/tourController_v2.js', 'utf-8');
const currentCode = fs.readFileSync('backend/controllers/tourController.js', 'utf-8');

const functionsToExtract = ['getMetadata', 'createDestination', 'updateDestination', 'deleteDestination'];
let addedCode = '';

for (const fn of functionsToExtract) {
  const startRegex = new RegExp(`const \\s*${fn}\\s*=\\s*async\\s*\\(req, res\\)\\s*=>\\s*\\{`);
  const match = v2Code.match(startRegex);
  if (match) {
    const startIndex = match.index;
    let endIndex = v2Code.indexOf('};\n\n//', startIndex);
    if (endIndex === -1) endIndex = v2Code.indexOf('};\n\nconst', startIndex);
    if (endIndex === -1) endIndex = v2Code.indexOf('};\nmodule.exports', startIndex);
    
    if (endIndex !== -1) {
      addedCode += '\n\n' + v2Code.substring(startIndex, endIndex + 2);
    }
  }
}

let newCode = currentCode.replace('module.exports = {', addedCode + '\n\nmodule.exports = {');

for (const fn of functionsToExtract) {
  if (!newCode.includes(`    ${fn}`)) {
    newCode = newCode.replace('module.exports = {', `module.exports = {\n    ${fn},`);
  }
}

fs.writeFileSync('backend/controllers/tourController.js', newCode);
