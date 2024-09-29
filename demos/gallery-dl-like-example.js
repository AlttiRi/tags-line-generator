import {ANSI_CYAN} from "@alttiri/util-node-js";
import {TagsLineGenerator} from "../src/main.js";
import {dateParts, renderTemplateString} from "./util.js";

import {createRequire} from "node:module";
const require = createRequire(import.meta.url);

const json1  = require("./jsons/sankaku-31250632.json");
const json2  = require("./jsons/sankaku-29652683.json");
const json3  = require("./jsons/sankaku-31113165.json");


/** @typedef {import("../src/tags-line-generator").TagsLineGenSetting} TagsLineGenSetting */


/** @type {TagsLineGenSetting} */
const computedTagsLineSetting = {
    "custom-props": {
        "__important": {
            "props": "tags",
            "only": "third-party_edit sound_edit ai_generated artist_request",
        },
        "__important_medium": {
            "props": "tags_medium",
            "only": "3d"
        },
        "__filtered_medium": {
            "props": "tags_medium",
            "ignore": "*filesize *resolution *filesize *aspect_ratio hd fhd"
        },
        "__custom_general": {
            "props": "tags_general",
            // "tag-limit": 2
        }
    },
    "ignore": "tagme  cg_art game_cg artist_cg  webm mp4  video animated",
    "replace": [
        ["megane", "glasses"]
    ],
    "only-one": [
        ["third-party_edit", "edit"],
        ["sound_edit", "edit"],
        ["one_piece:_two_years_later", "one_piece"],
    ],
    "props": [
        "tags_artist __important tags_character tags_copyright tags_studio",
        "__important_medium",
        "__custom_general",
        "tags_genre __filtered_medium tags_meta"
    ],
    // "only": "gwendolyn_tennyson violet_parr jessica_rabbit nico_robin",
    "len-limit": 100,
    // "tag-limit": 7
};
const tagsLineGen = new TagsLineGenerator(computedTagsLineSetting);

const filenamePatter = "[{category}] {id}—{YYYY}.{MM}.{DD}—{computedTagsLine}—{md5}.{extension}";
console.log(ANSI_CYAN(filenamePatter));


for (const json of [json1, json2, json3]) {
    const propsObject = json;
    Object.assign(propsObject, {
        ...json,
        ...dateParts(json.created_at * 1000),
        computedTagsLine: tagsLineGen.generateLine(propsObject),
    });

    const {value: filename} = renderTemplateString(filenamePatter, propsObject);
    console.log(filename, filename.length);
}
