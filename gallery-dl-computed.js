import {ANSI_CYAN, ANSI_RED_BOLD} from "@alttiri/util-node-js";

import json1 from "./jsons/sankaku-29652683.json"  assert {type: "json"};
import json2 from "./jsons/safebooru-5615470.json" assert {type: "json"};

// -------------
// Assume it's in gallery-dl.conf
/**
 * @type {{
 * customTags: {},
 * ignore: string[],
 * allTags: string[],
 * tags: string[],
 * [byteLimit]: number,
 * [separator]: string,
 * [splitter]: string,
 * [joiner]: string,
 * [deduplicate]: boolean,
 * }}
 */
const computedTagLineSetting = {
    "customTags": {
        "tags_important": {
            "source": ["tags"],
            "only": ["third-party_edit", "sound_edit", "paid_reward"],
        },
        "tags_important_general": {
            "source": ["tags_general"],
            "only": ["female_only"]
        }
    },
    "tags": ["tags_artist", "tags_important", "tags_character", "tags_important_general", "tags_copyright", "tags_studio", "tags_general", "tags_genre", "tags_medium", "tags_meta"],
    "ignore": ["tagme", "cg_art", "game_cg", "artist_cg", "webm", "mp4", "video", "animated"],
    "tags_meta": {
        "ignore": ["*filesize", "*resolution", "*filesize", "*aspect_ratio"]
    }
};
// -------------

const propsObject = {
    ...json1,
};
propsObject.computedTagLine = getComputedTagLine(computedTagLineSetting);

function getComputedTagLine(settings = {}) {
    const limit     = settings.limit     || 120;
    const byteLimit = settings.byteLimit || 120;
    const separator = settings.separator || " ";
    const splitter  = settings.splitter  || " ";
    const joiner    = settings.joiner    || " ";
    const deduplicate = settings.deduplicate || true;

    const allTags = settings.allTags.map(name => propsObject[name] || []).flat();
    const selectedTags = settings.tags || allTags || [];
    const tags = selectedTags.map(name => propsObject[name] || handleCustomTags(name) || []);


    function handleCustomTags(name) {
        const custom = settings.customTags[name];
        if (!custom) {
            return;
        }
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
