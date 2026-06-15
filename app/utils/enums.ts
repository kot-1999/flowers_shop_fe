export enum UserRole {
    Admin = 'Admin',
    User = 'User',
    NotRegistered = 'NotRegistered'
}

export enum Language {
    en = 'en',
    ua = 'ua',
    sk = 'sk',
    de = 'de'
}

export enum CookieKey {
    Settings = 'appSettings'
}

export enum LocalStorageKey {
    SearchSettings = 'searchSettings',
    HomePagination = 'homePagination',
    SelectedCategory = 'selectedCategory',
    ItemTypePagination = 'itemTypesPagination',
    TagPagination = 'tagPagination',
    SelectionistPagination = 'selectionistPagination',
    CategoryPagination = 'categoryPagination',
    GoodPagination = 'goodPagination',
}

export enum GoodState{
    Available = 'Available',
    NoShow = 'NoShow',
    Awaiting = 'Awaiting',
    Deleted = 'Deleted'
}

export enum Defaults {
    Page = 1,
    Limit = 24
}