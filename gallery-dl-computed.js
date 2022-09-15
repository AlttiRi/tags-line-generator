import {ANSI_CYAN, ANSI_RED_BOLD} from "@alttiri/util-node-js";

// import json1 from "./jsons/sankaku-29652683.json"  assert {type: "json"};
import json1 from "./jsons/sankaku-31250632.json"  assert {type: "json"};
import json2 from "./jsons/safebooru-5615470.json" assert {type: "json"};
import {TagsLineGenerator} from "./tags-line-generator.js";

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
            "ignore": ["*filesize", "*resolution", "*filesize", "*aspect_ratio", "hd", "fhd"]
        },
        "tags__custom_general": {
            "source": ["tags_general"],
            // "tagsLimit": 3
        }
    },
    "ignore": ["tagme", "cg_art", "game_cg", "artist_cg", "webm", "mp4", "video", "animated"],
    "replace": [
        ["megane", "glasses"]
    ],
    "selectedSets": [
        "tags_artist", "tags__important", "tags_character", "tags_copyright", "tags_studio",
        "tags__important_medium",
        "tags__custom_general",
        "tags_genre", "tags__custom_medium", "tags_meta"
    ],
    // "only": ["gwendolyn_tennyson", "violet_parr"],
    // "tagsLimit": 7
};
// -------------

const propsObject = {
    ...json1,
};

const tagsLine = new TagsLineGenerator(computedTagLineSetting);
propsObject.computedTagLine = tagsLine.computeLine(propsObject);



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
