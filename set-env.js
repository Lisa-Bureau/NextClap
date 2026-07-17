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

let tmdbToken = (process.env.tmdbToken || '').trim();
// Si le token commence et finit par des guillemets ou apostrophes, on les enlève
tmdbToken = tmdbToken.replace(/^['"]|['"]$/g, '');

let tmdbUrl = (process.env.tmdbUrl || '').trim();
tmdbUrl = tmdbUrl.replace(/^['"]|['"]$/g, '');

// 3. On prépare le contenu du fichier (avec des backticks ` pour être tranquille)
const envConfigFile = `export const environment = {
  production: ${isProduction},
  tmdbToken: \`${tmdbToken}\`,
  tmdbUrl: \`${tmdbUrl}\`
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