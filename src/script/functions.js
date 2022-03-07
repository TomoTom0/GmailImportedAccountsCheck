
// -------------------------------------
//         # storage functions

const getSyncStorage = (key = null) => new Promise(resolve => {
    chrome.storage.sync.get(key, resolve);
});

const setSyncStorage = (key = null) => new Promise(resolve => {
    chrome.storage.sync.set(key, resolve);
});

const operateStorage=(key = null, storageKey="sync", operate="get") => new Promise(resolve => {
    chrome.storage[storageKey][operate](key, resolve);
});