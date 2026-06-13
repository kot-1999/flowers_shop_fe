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
    namespaceSeparator: false,
    sort: false,
    jsSafeValue: false,
    defaultValue: (locale, ns, key) => key,
};