// Generates docs/BLOCKS.md from data/blocks.json
const fs=require('fs'),path=require('path');
const api=require('../lib/api');const {CATEGORY_RU}=require('../lib/catalog');
let md='# Блоки Robbo Scratch 3 (автоматически извлечены из программы)\n\nФормат записи: `opcode` — «надпись в Robbo Scratch», затем поля. Как использовать — см. FORMAT.md.\n\n';
for(const c of Object.keys(CATEGORY_RU)) { const t=api.listBlocks({category:c}); if(!t.startsWith('Ничего')) md+=t+'\n\n'; }
fs.writeFileSync(path.join(__dirname,'../docs/BLOCKS.md'),md);
console.log(md.length);
