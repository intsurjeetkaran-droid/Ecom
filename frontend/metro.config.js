const { getDefaultConfig } = require('expo/metro-config');

// Step 1: get base config
const config = getDefaultConfig(__dirname);

// Step 2: ensure 'web' platform is registered for .web.js resolution
config.resolver.platforms = ['ios', 'android', 'web', 'native'];

// Step 3: ensure Metro checks 'browser' field in package.json for web
config.resolver.mainFields = ['browser', 'main', 'module'];

// Step 4: wrap resolver with our web-platform stubs
const defaultResolver = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // Stub all Node.js built-ins that have no browser equivalent
    const nodeBuiltins = new Set([
      'net', 'tls', 'fs', 'dns', 'child_process',
      'readline', 'os', 'path', 'crypto', 'zlib',
      'http', 'https', 'stream', 'util', 'events',
      'assert', 'url', 'querystring', 'string_decoder',
      'buffer', 'process', 'vm', 'domain', 'punycode',
      'constants', 'sys', 'timers', 'perf_hooks',
    ]);
    if (nodeBuiltins.has(moduleName)) {
      return { type: 'empty' };
    }

    // Stub Node.js-only socket.io / engine.io / ws dependencies
    const nodeOnlyModules = new Set([
      'xmlhttprequest-ssl',  // Node.js XHR — browser uses native XHR
      'ws',                  // Node.js WebSocket — browser uses native WebSocket
      'bufferutil',          // Native Node.js addon
      'utf-8-validate',      // Native Node.js addon
      '@xmldom/xmldom',      // Node.js XML parser
    ]);
    if (nodeOnlyModules.has(moduleName)) {
      return { type: 'empty' };
    }

    // Map .node.js files to their browser equivalents
    if (moduleName.endsWith('.node.js')) {
      const browserVersion = moduleName.replace('.node.js', '.js');
      try {
        return context.resolveRequest(context, browserVersion, platform);
      } catch (_) {
        // fall through to default
      }
    }
  }

  // Delegate to default resolver
  if (defaultResolver) return defaultResolver(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
