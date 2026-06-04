module.exports = {
    locales: ['en', 'ua', 'de', 'sk'],
    defaultNamespace: 'common',
    output: 'locales/$LOCALE.json',
    input: [
        'app/**/*.{ts,tsx}',
    ],
    createOldCatalogs: false,
    keepRemoved: false,
    keySeparator: false,
    namespaceSeparator: false
};