import {ANSI_CYAN, ANSI_RED_BOLD} from "@alttiri/util-node-js";

// import json1 from "./jsons/sankaku-29652683.json"  assert {type: "json"};
import json1 from "./jsons/sankaku-31250632.json"  assert {type: "json"};
import json2 from "./jsons/safebooru-5615470.json" assert {type: "json"};

// -------------
// Assume it's in gallery-dl.conf
/**
 * @type {{
 * customSets: {},
 * ignore: string[],
 * selectedSets: string[],
 * [limitType]: "chars"|"bytes",
 * [separator]: string,
 * [splitter]: string,
 * [joiner]: string,
 * [deduplicate]: boolean,
 * }}
 */
const computedTagLineSetting = {
    "customSets": {
        "tags__important": {
            "source": ["tags"],
            "only": ["third-party_edit", "sound_edit"],
        },
        "tags__important_medium": {
            "source": ["tags_medium"],
            "only": ["3d"]
        },
        "tags__custom_medium": {
            "source": ["tags_medium"],
            "ignore": ["*filesize", "*resolution", "*filesize", "*aspect_ratio"]
        }
    },
    "ignore": ["tagme", "cg_art", "game_cg", "artist_cg", "webm", "mp4", "video", "animated"],
    "selectedSets": [
        "tags_artist", "tags__important", "tags_character", "tags_copyright", "tags_studio",
        "tags__important_medium",
        "tags_general",
        "tags_genre", "tags__custom_medium", "tags_meta"
    ]
};
// -------------

const propsObject = {
    ...json1,
};
propsObject.computedTagLine = getComputedTagLine(computedTagLineSetting);

function getComputedTagLine(settings = {}) {
    const limit       = settings.limit       || 120;
    /** @type {"chars"|"bytes"} */
    const limitType   = settings.limitType   || "chars";
    const joiner      = settings.joiner      || " ";
    const deduplicate = settings.deduplicate || true;
    // const separator = settings.separator     || " ";
    // const splitter  = settings.splitter      || " ";

    const selectedSets = settings.selectedSets || [];
    const customSets   = settings.customSets   || {};
    const ignore       = new Set(settings.ignore || []);


    const customTagsMap = handleCustomTagsSets(propsObject, customSets);
    const sets = selectedSets.map(name => propsObject[name] || customTagsMap.get(name) || []);
    let tags = sets.flat();
    if (deduplicate) {
        tags = new Set(tags);
    }

    const length = getLengthFunc(limitType);

    let result = "";
    for (const tag of tags) {
        if (ignore.has(tag)) {
            continue;
        }
        if (length(result + joiner + tag) <= limit) {
            result = result.length ? result + joiner + tag : tag;
        }
    }

    return result;
}

function getLengthFunc(limitType) {
    if (limitType === "bytes") {
        const te = new TextEncoder();
        return function(string) {
            return te.encode(string).length;
        }
    }
    return function(string) {
        return string.length;
    }
}

function handleCustomTagsSets(propsObject, customSets) {
    const customTagsMap = new Map();
    for (const [name, opts] of Object.entries(customSets)) {
        const source = propsObject[opts.source] || customTagsMap.get(opts.source);

        const specialTags = new Set(opts.only || opts.ignore);
        let result;
        if (opts.only) {
            result = source.filter(tag => specialTags.has(tag));
        } else
        if (opts.ignore) {
            result = source.filter(tag => !specialTags.has(tag));
            for (const specialTag of specialTags) {
                if (specialTag.startsWith("*") || specialTag.endsWith("*")) {
                    let matcher;
                    if (specialTag.startsWith("*") && specialTag.endsWith("*")) {
                        const substring = specialTag.slice(1, -1);
                        matcher = text => !text.includes(substring);
                    } else
                    if (specialTag.startsWith("*")) {
                        const substring = specialTag.slice(1);
                        matcher = text => !text.endsWith(substring);
                    } else
                    if (specialTag.endsWith("*")) {
                        const substring = specialTag.slice(0, -1);
                        matcher = text => !text.startsWith(substring);
                    }
                    result = result.filter(matcher);
                }
            }
        }
        customTagsMap.set(name, result);
    }

    return customTagsMap;
}



const filenamePatter = "{id}—{computedTagLine}—{md5}.{extension}";
console.log(ANSI_CYAN(filenamePatter));


const {value: resolvedFilename} = renderTemplateString(filenamePatter);
console.log(resolvedFilename);
console.log(resolvedFilename.length);


/**
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
