# vue-agcdn-mgmt

Vue app that is embedded within the pantheon_agcdn_management [Drupal Module](https://github.com/pantheon-systems/pantheon_agcdn_management) and [WordPress plugin](https://github.com/pantheon-systems/pantheon-agcdn-management).

## Submodule Contexts

This application can now honor a 'submodule' variable that allows the application to function in a specific context.

### default

All functionality. Purge AGCDN cache, manage all dictionaries and ACLs.

### settings

Purge AGCDN cache and manage only the settings dictionary.

## Development

### Initial Setup

```
npm install
```

### Build tasks

`npm run watch` - runs development builds in watch mode
`npm run build:watch` - runs build in development mode
`npm run build:prod` - runs build in production mode

For tagged releases, production builds in the dist directory are committed to the repository.

The consuming module/plugin will consume the JS bundle via the jsdelivr CDN. https://cdn.jsdelivr.net/gh/pantheon-systems/vue-agcdn-mgmt@v0.9/dist/main.js

