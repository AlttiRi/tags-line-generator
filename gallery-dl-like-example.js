import {ANSI_CYAN} from "@alttiri/util-node-js";
import {TagsLineGenerator} from "./tags-line-generator.js";
import {dateParts, renderTemplateString} from "./util.js";

import json1 from "./jsons/sankaku-31250632.json" assert {type: "json"};
import json2 from "./jsons/sankaku-29652683.json" assert {type: "json"};
import json3 from "./jsons/sankaku-31113165.json" assert {type: "json"};


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
    "onlyOne": [
        ["third-party_edit", "edit"],
        ["sound_edit", "edit"],
        ["one_piece:_two_years_later", "one_piece"],
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
const tagsLineGen = new TagsLineGenerator(computedTagLineSetting);

const filenamePatter = "[{category}] {id}—{YYYY}.{MM}.{DD}—{computedTagLine}—{md5}.{extension}";
console.log(ANSI_CYAN(filenamePatter));


for (const json of [json1, json2, json3]) {
    const propsObject = json;
    Object.assign(propsObject, {
        computedTagLine: tagsLineGen.generateLine(propsObject),
        ...dateParts(propsObject.created_at * 1000),
    });

    const {value: filename} = renderTemplateString(filenamePatter, propsObject);
    console.log(filename, filename.length);
}
