const fs = require('fs');

const path = '/Users/chrix/Desktop/HE-5/resources/js/Pages/Admin/Finances/Index.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace activeYearTab and sortedYears in the UI
content = content.replace(/sortedYears/g, 'sortedCategories');
content = content.replace(/activeYearTab/g, 'activeTab');
content = content.replace(/setActiveYearTab/g, 'setActiveTab');
content = content.replace(/transactionsByYear/g, 'transactionsByCategory');

content = content.replace(/\{year\}/g, '{cat}');
content = content.replace(/key=\{year\}/g, 'key={cat}');
content = content.replace(/const year = activeTab;/g, 'const cat = activeTab;');
content = content.replace(/const yearTxs = transactionsByCategory\[cat\];/g, 'const catTxs = transactionsByCategory[cat];');
content = content.replace(/yearTxs/g, 'catTxs');
content = content.replace(/yearTotal/g, 'catTotal');
content = content.replace(/yearPaid/g, 'catPaid');
content = content.replace(/yearPending/g, 'catPending');
content = content.replace(/📅 \{cat\}/g, '📂 {cat}');
content = content.replace(/Tabs por año/g, 'Tabs por categoría');
content = content.replace(/Tabla de transacciones del año activo/g, 'Tabla de transacciones de la categoría activa');

fs.writeFileSync(path, content);
console.log("Updated Index.jsx view logic");
