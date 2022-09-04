import {ANSI_CYAN, ANSI_RED_BOLD} from "@alttiri/util-node-js";

import json1 from "./jsons/sankaku-29652683.json"  assert {type: "json"};
import json2 from "./jsons/safebooru-5615470.json" assert {type: "json"};

// -------------
// Assume it's in gallery-dl.conf
const computedTagLineSetting = {
    "allTags": ["tags"],
    "custom": {
        "tags_important": ["third-party_edit", "sound_edit", "paid_reward"],
    },
    "tags": ["tags_artist", "tags_important", "tags_character", "tags_copyright", "tags_studio", "tags_general", "tags_genre", "tags_medium", "tags_meta"],
    "deduplicate": true,
    "limit": 130,
    "byteLimit": 130,
    "separator": " ",
    "splitter": " ",
    "ignore": ["*filesize", "*resolution"]
};
// -------------

const propsObject = {
    ...json1,
};
propsObject.computedTagLine = getComputedTagLine(computedTagLineSetting);

function getComputedTagLine(settings = {}) {
    let {tags, limit, byteLimit, separator, custom} = settings;
    tags = tags || [];
    limit = limit || 100;
    separator = separator || " ";

    const allTags = settings.allTags.map(name => propsObject[name] || []).flat();
    tags = tags.map(name => propsObject[name] || (settings.custom[name] ? handleCustomTags(settings.custom[name]) : []));

    function handleCustomTags(custom) {
        return custom.filter(tag => allTags.includes(tag));
    }

    function length(string) {
        if (byteLimit) {
            return new TextEncoder().encode(string).length;
        } else {
            return string.length;
        }
    }

    return tags
        .flat()
        .reduce((result, tag) => {
            if (length(result) + length(separator) + length(tag) <= limit) {
                return result.length ? result + separator + tag : tag;
            }
            return result;
        }, "");
}




const filenamePatter = "{id}—{computedTagLine}—{md5}.{extension}";
console.log(ANSI_CYAN(filenamePatter));


const {value: resolvedFilename} = renderTemplateString(filenamePatter);
console.log(resolvedFilename);
console.log(resolvedFilename.length);


/**
 *
 * @param template
 * @param props
 * @return {{hasUndefined: boolean, value: string}}
 */
function renderTemplateString(template, props = propsObject) {
    let hasUndefined = false;
    const value = template.replaceAll(/{[^{}]+?}/g, (match, index, string) => {
        const key = match.slice(1, -1);
        const value = props[key];
        if (value === undefined) {
            console.log(ANSI_RED_BOLD(`[renderTemplateString] ${match} is undefined`));
            hasUndefined = true;
        }
        return value;
    });
    return {hasUndefined, value};
}
