import fs from 'fs';

let data = fs.readFileSync('server.js', 'utf8');

// 1. Add imports
const importAuth = 'import { verifyAuth } from "./middleware/auth.js";';
const newImports = `import { verifyAuth } from "./middleware/auth.js";\nimport { require2FA } from "./middleware/require2FA.js";\nimport twoFactorRoutes from "./routes/twoFactorRoutes.js";`;

data = data.replace(importAuth, newImports);

// 2. Mount 2FA Routes
const preferencesMount = "app.use('/api/preferences', preferencesRoutes);";
const newRoutes = `app.use('/api/preferences', preferencesRoutes);\n\n// Mount 2FA Routes\napp.use('/api/2fa', twoFactorRoutes);`;

data = data.replace(preferencesMount, newRoutes);

// 3. Add require2FA to all verifyAuth routes
data = data.replace(/, verifyAuth, async/g, ", verifyAuth, require2FA, async");

fs.writeFileSync('server.js', data, 'utf8');
console.log("Updated server.js");
