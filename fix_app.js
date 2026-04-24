const fs = require('fs');
const file = 'server/src/app.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import chatRoutes')) {
  content = content.replace(
    "import groupBuyRoutes from './routes/groupBuy.routes.js'", 
    "import groupBuyRoutes from './routes/groupBuy.routes.js'\nimport chatRoutes from './routes/chat.routes.js'"
  );
  
  content = content.replace(
    "app.use('/api/group-buys', groupBuyRoutes)",
    "app.use('/api/group-buys', groupBuyRoutes)\napp.use('/api/chat', chatRoutes)"
  );
  fs.writeFileSync(file, content);
}
