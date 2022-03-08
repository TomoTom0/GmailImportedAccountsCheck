"use strict";

// ----------------------
//     # functions

function _obtainElmForImportedAccounts(args={settings: defaultSettings, configInfos: defaultEmptyConfigInfo }) {
    const urlInfo = _parseUrlForGmail();
    if (urlInfo.mode != "settings" ||
        !/^accounts/.test(urlInfo.others)) {
        return {};
    }

    // check whether imported accounts exist or not
    const divs_imported = Array.from(document.querySelectorAll("div.nH.r4>table>tbody tr:nth-child(5) td.r9>div"));
    if (divs_imported.length == 0) return {};
    else if (divs_imported.length == 1) {
        // then no accounts is imported
        return { divs_imported: divs_imported };
    }

    const spans_arr = Array.from(document.querySelectorAll("div.nH.r4>table>tbody tr:nth-child(5) td.r9>div>table>tbody>tr>td span"));
    if (spans_arr.length < 4) return { divs_imported: divs_imported };
    
    const identifierInfo = obtainValidConfig({key:"Identifier", ...args});
    const text_dict = {
        lastchecked: new RegExp(identifierInfo.lastchecked+"|"+identifierInfo.clicked_lastchecked),
        history: new RegExp(identifierInfo.history),
        checkmail: new RegExp(identifierInfo.checkmail+"|"+identifierInfo.clicked_checkmail)
    }
    const elms_valid_tmp = Object.keys(text_dict).map(k_text => {
        const v_text = text_dict[k_text];
        const spans_filtered = spans_arr.filter(d => v_text.test(d.innerHTML));
        if (spans_filtered.length == 0) return {};
        else return { [k_text]: spans_filtered };
    });
    return Object.assign({ divs_imported: divs_imported }, ...elms_valid_tmp);
}

function _obtainElmForMailBox() {
    const urlInfo = _parseUrlForGmail();
    if (urlInfo.mode == "settings") return {};
    // for #inbox
    const ref_button = document.querySelector("div.nH.ar4.z>div>div.aeH>div:nth-last-child(1)>div>div>div>div>div:nth-child(5)");
    if (ref_button == null) return {};
    return { refresh: ref_button };
}

function _parseUrlForGmail() {
    const url_now = location.href;
    const gmail_regex = /(https?):\/\/mail\.google\.com\/mail\/u\/(\d+)\/[^\#\/]*\#([^\/]+)\/?(.*)/
    const url_match_arr = url_now.match(gmail_regex);
    return {
        url: url_now,
        protocol: url_match_arr[1],
        userid: url_match_arr[2],
        mode: url_match_arr[3],
        others: url_match_arr[4]
    }
}

function _clickCheckBtn(_callback = null) {
    const checkSpan = setInterval(() => {
        const elmsValid = _obtainElmForImportedAccounts();
        if (Object.keys(elmsValid).indexOf("divs_imported") == -1) return;
        else if (elmsValid.divs_imported.length == 1) {
            // then no accounts is imported
            clearInterval(checkSpan);
            return;
        } else if (Object.keys(elmsValid).indexOf("checkmail") == -1) return;
        clearInterval(checkSpan);
        const spans_checkmail = elmsValid.checkmail;
        for (const el of spans_checkmail) {
            el.click();
        }
    }, 1000);
    if (typeof _callback === "function") _callback();
    return 0;
}

function _addButton() {
    function _generateCheckButton() {
        const div_dicts = [{ class: "G-Ni J-J5-Ji" },
        {
            class: "T-I J-J5-Ji",
            act: "20", role: "button", tabindex: "0",
            "data-tooltip": "Check External Mail",
            "aria-label": "Check External Mail",
            style: "user-select: none;"
        },
        { class: "asa" },
        { class: "HR T-I-J3 J-J5-Ji btn_CheckExternalMail" }]
        let divs = div_dicts.map(div_dict => {
            let div = document.createElement("div");
            for (const k in div_dict) {
                const v = div_dict[k];
                div.setAttribute(k, v)
            }
            return div;
        })
        for (const ind of [...Array(3).keys()]) {
            let div = divs[ind];
            const div_next = divs[ind + 1];
            div.appendChild(div_next);
        }
        return divs[0];
    }
    const confirmRefreshButton = setInterval(() => {
        const elmsValid = _obtainElmForMailBox();
        if (Object.keys(elmsValid).indexOf("refresh") == -1) return;
        const ref_button = elmsValid.refresh;
        clearInterval(confirmRefreshButton);
        const btn = _generateCheckButton();
        ref_button.after(btn);
    }, 500);
}


function _mailCheckForImportedAccounts() {
    const urlInfo = _parseUrlForGmail();
    // url is not valid
    if (urlInfo.userid.length == 0) return;
    const url_settings = `${urlInfo.protocol}://mail.google.com/mail/u/${urlInfo.userid}/#settings/accounts`;
    const win = window.open(url_settings, "checkExternalMail", "width=500,toolbar=yes,menubar=yes,scrollbars=yes");
    win.postMessage("trigger_checkExternalMail", "*");
    win.addEventListener("load", () => {
        win.postMessage("trigger_checkExternalMail", "*");
    }, false);
}

//------------------------------------
//         #  window.onload
window.onload = async () => {
    _addButton();

    document.addEventListener("click", async function (e) {
        const el = e.target;
        if (el.children.length > 0 &&
            el.children[0].classList !== null &&
            Array.from(el.children[0].classList).indexOf("btn_CheckExternalMail") != -1) {
            const items = await getSyncStorage({ settings: defaultSettingsString, configInfos: defaultConfigStrings });
            const settings = JSON.parse(items.settings);
            const configInfos = JSON.parse(items.configInfos);            
            console.log("open window");
            _mailCheckForImportedAccounts({settings: settings, configInfos: configInfos });
        }
    });
    window.addEventListener("message", async function (e) {
        const content = e.data;
        if (!/^trigger_/.test(content)) return;
        const items = await getSyncStorage({ settings: defaultSettingsString, configInfos: defaultConfigStrings });
        const settings = JSON.parse(items.settings);
        const configInfos = JSON.parse(items.configInfos);
    
        console.log(content);
        if (/_checkExternalMail/.test(content)) {
            function _closeWindow() {
                if (window.opener === null) return;
                // automtically close
                // read settings
                if (settings.autoCloseWindow === false) return;
                setTimeout(() => {
                    window.opener.postMessage("trigger_closeWindow_refreshMail", "*");
                }, 15 * 1000);
                const confirmClicked = setInterval(() => {
                    const elmsValid = _obtainElmForImportedAccounts();
                    if (Object.keys(elmsValid).indexOf("checkmail") == -1) return;
                    const identifierInfo = obtainValidConfig({key:"Identifier", settings:settings, configInfos: configInfos});
                    const check_dict = {
                        lastchecked: new RegExp(identifierInfo.clicked_lastchecked),
                        checkmail: new RegExp(identifierInfo.clicked_checkmail)
                    }
                    const judgedElms = Object.keys(check_dict).some(k => {
                        const v_regex = check_dict[k];
                        return elmsValid[k].every(d => v_regex.test(d.innerHTML));
                    });
                    if (!judgedElms) return;
                    clearInterval(confirmClicked);
                    window.opener.postMessage("trigger_closeWindow_refreshMail", "*");
                }, 500);
            }
            _clickCheckBtn(_closeWindow);
        }
        if (/_closeWindow/.test(content)) {
            e.source.close();
        }
        if (/_refreshMail/.test(content)) {
            const confirmRefreshButton = setInterval(() => {
                const elmsValid = _obtainElmForMailBox();
                if (Object.keys(elmsValid).indexOf("refresh") == -1) return;
                const ref_button = elmsValid.refresh;
                clearInterval(confirmRefreshButton);
                ref_button.click();
            }, 500);
        }
        return true;
    }, false);

}
