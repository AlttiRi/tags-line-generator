import {ANSI_CYAN} from "@alttiri/util-node-js";
import {TagsLineGenerator} from "./tags-line-generator.js";
import {dateParts, renderTemplateString} from "./util.js";

import json1 from "./jsons/sankaku-31250632.json"  assert {type: "json"};
import json2 from "./jsons/safebooru-5615470.json" assert {type: "json"};
import json3 from "./jsons/sankaku-29652683.json"  assert {type: "json"};


const propsObject = json1;

/** @type {ComputedTagLineSetting} */
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

const tagsLine = new TagsLineGenerator(computedTagLineSetting);
Object.assign(propsObject, {
    computedTagLine: tagsLine.computeLine(propsObject),
    ...dateParts(propsObject.created_at * 1000),
});


const filenamePatter = "[{category}] {id}—{YYYY}.{MM}.{DD}—{computedTagLine}—{md5}.{extension}";
console.log(ANSI_CYAN(filenamePatter));

const {value: filename} = renderTemplateString(filenamePatter, propsObject);
console.log(filename);
console.log(filename.length);
