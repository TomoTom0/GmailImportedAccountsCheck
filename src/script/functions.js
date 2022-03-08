
// -------------------------------------
//         # storage functions

const defaultSettings={autoCloseWindow:true, changeIdentifierConfig:false};
const defaultSettingsString=JSON.stringify(defaultSettings);

const configInfoEmpty = { }
const defaultEmptyConfigInfo = Object.assign(...["Identifier"]
    .map(d => { return { [d]: configInfoEmpty } }));
const defaultConfigStrings = JSON.stringify(defaultEmptyConfigInfo);

const defaultConfigInfo = {
    Identifier: {lastchecked:"前回のメール チェック:|Last checked:",
    history:"履歴を表示|View history",
    checkmail:"メールを今すぐ確認する|Check mail now",
    clicked_lastchecked:"取得したメールは|取得しました|fetched",
    clicked_checkmail:"メールの確認中|Checking mail"
    }
}



const getSyncStorage = (key = null) => new Promise(resolve => {
    chrome.storage.sync.get(key, resolve);
});

const setSyncStorage = (key = null) => new Promise(resolve => {
    chrome.storage.sync.set(key, resolve);
});

const operateStorage=(key = null, storageKey="sync", operate="get") => new Promise(resolve => {
    chrome.storage[storageKey][operate](key, resolve);
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function obtainValidConfig(args={key:"", settings:defaultSettings, configInfos:defaultEmptyConfigInfo}){
    if (Object.keys(defaultConfigInfo).indexOf(args.key)==-1) return {};
    const isChanged = Object.keys(args.settings).indexOf(`change${args.key}Config`)!=-1 || args.settings[`change${key}Config`];
    if (!isChanged) return defaultConfigInfo[args.key];
    return Object.assign(...Object.entries(defaultConfigInfo[args.key]).map(kv=>{
        const isValid=Object.keys(args.configInfos).indexOf(kv[0])!=-1 && args.configInfos[kv[0]].length>0;
        if (isValid) return {[kv[0]]: args.configInfos[kv[0]]};
        else return {[kv[0]]:kv[1]};
    }))
}