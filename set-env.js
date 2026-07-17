const fs = require('fs');
const path = require('path');

// Chemins vers le dossier et le fichier cible
const dirPath = path.join(__dirname, 'src', 'environments');
const filePath = path.join(dirPath, 'environment.ts');

// 1. On s'assure que le dossier "environments" existe sur le serveur de build
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// 2. On récupère les variables et on retire les éventuels guillemets/apostrophes parasites
const isProduction = process.env.production === 'true';
const tmdbToken = (process.env.tmdbToken || '').trim();
const tmdbUrl = (process.env.tmdbUrl || '').trim();

// 3. On utilise JSON.stringify pour injecter proprement les chaînes de caractères
const envConfigFile = `export const environment = {
  production: ${isProduction},
  tmdbToken: ${JSON.stringify(tmdbToken)},
  tmdbUrl: ${JSON.stringify(tmdbUrl)}
};
`;

// 4. On écrit physiquement le fichier sur le disque du serveur de build
try {
  fs.writeFileSync(filePath, envConfigFile, 'utf8');
  console.log('✅ environment.ts généré avec succès avec les variables de l\'hébergeur !');
} catch (err) {
  console.error('❌ Impossible de générer le fichier d\'environnement :', err);
  process.exit(1);
}