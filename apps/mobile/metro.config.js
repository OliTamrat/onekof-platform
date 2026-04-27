const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Only watch the mobile app + workspace node_modules.
// Explicitly excludes apps/web to prevent Metro crashing on Windows
// due to illegal characters (?) in Next.js generated .next/types paths.
config.watchFolders = [
  projectRoot,
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
