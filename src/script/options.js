"use strict";

// ----------------------------------
//            # initial


// # on load
$(async function () {
    const items=await getSyncStorage({settings: defaultSettingsString, configInfos:defaultConfigStrings});
    const settings=JSON.parse(items.settings);
    const configInfos=JSON.parse(items.configInfos);

    Object.entries(settings).map(kv=>{
        if (typeof(kv[1]) === "boolean") {
            const checkArea=$(`#check_${kv[0]}`);
            checkArea.prop({"checked":kv[1]});
        }
    })
    Object.entries(configInfos).forEach(kv=>{
        //console.log(kv)
        const configKey=kv[0];
        const configArea=$(`div.change${configKey}Config`);

        Object.entries(kv[1]).forEach(kv2=>{
            const key=kv2[0];
            const val=kv2[1];
            $(`input.inputChange${key.slice(0,1).toUpperCase()+key.slice(1)}`, 
            configArea).val(val);
        })
    })
        
});

// # addEventListener
document.addEventListener("click", async function (e) {
    if ($(e.target).attr("class") && $(e.target).attr("class").indexOf("btnSave_change") != -1) {
        const configKey=$(e.target).attr("class").match(/(?<=btnSave_change)\S+(?=Config)/)[0];
        const KVs=$("input", $(e.target).parent()).map((ind, obj)=>{
            const inputKey=$(obj).attr("class").replace(/inputChange/, "").toLowerCase();
            const inputVal=$(obj).val();
            //console.log(inputKey, inputVal);
            return [[inputKey, inputVal]];
        });
        let configInfos=await getSyncStorage({configInfos:defaultConfigStrings}).then(items=>JSON.parse(items.configInfos))
        configInfos[configKey]=Object.assign(...Array.from(KVs)
            .map(kv=>Object({[kv[0]]:kv[1]}) ));
        await setSyncStorage({configInfos:JSON.stringify(configInfos)});
    }

})
document.addEventListener("change", async function (e) {
    if ($(e.target).attr("class").indexOf("check_settings")!=-1){
        let settings=await getSyncStorage({settings:defaultSettingsString}).then(items=>JSON.parse(items.settings));
        const checkKey=$(e.target).attr("id").replace(/check_/, "");
        settings[checkKey]=$(e.target).prop("checked");
        //console.log(settings);
        await setSyncStorage({settings:JSON.stringify(settings)});
    }
})