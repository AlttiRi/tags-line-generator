import {t as test} from "./tester.js";

import sankaku1  from "./jsons/sankaku-29652683.json"   assert {type: "json"};
import sankaku2  from "./jsons/sankaku-31250632.json"   assert {type: "json"};
import sankaku3  from "./jsons/sankaku-31113165.json"   assert {type: "json"};
import pixiv     from "./jsons/pixiv-78254724.json"     assert {type: "json"};
import safebooru from "./jsons/safebooru-5615470.json"  assert {type: "json"};
import paheal    from "./jsons/paheal-3864982.json"     assert {type: "json"};

import {TagsLineGenerator} from "../src/main.js";
/** @typedef {import("../src/tags-line-generator").TagsLineGenSetting} TagsLineGenSetting */
/** @typedef {import("../src/tags-line-generator").PropsObject} PropsObject */

/** @type {number[]} */
const testOnly = [];

/** @type {TagsLineGenerator} */
let tagsLineGen;
/**
 * @param {Object} opts
 * @param {TagsLineGenSetting?} opts.genSettings
 * @param {PropsObject} opts.propsObject
 * @param {string} opts.expected
 */
function t({genSettings, propsObject, expected}) {
    if (genSettings !== undefined) {
        tagsLineGen = new TagsLineGenerator(genSettings);
    }
    const result = tagsLineGen.generateLine(propsObject);
    test({result, expected, stackDeep: 1, testOnly});
}


t({
    genSettings: {
        "props": ["tags"],
    },
    propsObject: sankaku1,
    expected: "who_framed_roger_rabbit jessica_rabbit nikita_varb high_resolution very_high_resolution large_filesize paid_reward 1girl"
});
t({
    propsObject: paheal,
    expected: "Metal_Gear Metal_Gear_Solid_V Quiet Vg_erotica animated webm"
});


t({
    genSettings: {
        "props": ["tags"],
        "ignore": ["animated", "webm", "mp4"]
    },
    propsObject: paheal,
    expected: "Metal_Gear Metal_Gear_Solid_V Quiet Vg_erotica"
});

t({
    genSettings: {
        "props": ["tags"],
        "ignore": "animated webm mp4"
    },
    propsObject: paheal,
    expected: "Metal_Gear Metal_Gear_Solid_V Quiet Vg_erotica"
});

t({
    genSettings: {
        "props": "tags",
        "ignore": "animated webm mp4"
    },
    propsObject: paheal,
    expected: "Metal_Gear Metal_Gear_Solid_V Quiet Vg_erotica"
});


t({
    genSettings: {
        "props": ["tag_string"],
        "tagLimit": 3
    },
    propsObject: sankaku1,
    expected: "who_framed_roger_rabbit jessica_rabbit nikita_varb"
});



t({
    genSettings: {
        "props": ["tags"],
        "tagLimit": 3
    },
    propsObject: paheal,
    expected: "Metal_Gear Metal_Gear_Solid_V Quiet"
});


t({
    genSettings: {
        "props": ["tags"],
        "tagLimit": 3,
        "joiner": ", ",
        "split": false
    },
    propsObject: pixiv,
    expected: "blue, Arknights 10000+ bookmarks, Arknights"
});


t({
    genSettings: {
        "props": "tag_string_artist tag_string_character",
    },
    propsObject: sankaku2,
    expected: "redmoa raven_(dc) gwendolyn_tennyson violet_parr"
});
t({
    propsObject: sankaku3,
    expected: "hagiwara_studio barkkung101 nami_(one_piece) nico_robin"
});


t({
    genSettings: {
        "props": "tag_string_artist tag_string_character",
        "lenLimit": 40
    },
    propsObject: sankaku2,
    expected: "redmoa raven_(dc) gwendolyn_tennyson"
});
t({
    propsObject: sankaku3,
    expected: "hagiwara_studio barkkung101 nico_robin"
});


t({
    genSettings: {
        "props": "tags",
        "lenLimit": 5
    },
    propsObject: sankaku2,
    expected: "3d hd"
});
t({
    propsObject: sankaku3,
    expected: "3d"
});


t({
    genSettings: {
        "props": "tags",
        "lenLimit": 1,
    },
    propsObject: sankaku2,
    expected: ""
});


t({
    genSettings: {
        "props": "tags",
        "lenLimit": 0 // or null === default (120)
    },
    propsObject: sankaku2,
    expected: "teen_titans ben_10 the_incredibles raven_(dc) gwendolyn_tennyson violet_parr redmoa high_resolution english animated 3d"
});


const tags1 =
    "teen_titans ben_10 the_incredibles raven_(dc) gwendolyn_tennyson violet_parr redmoa high_resolution english " +
    "16:9_aspect_ratio large_filesize animated 3d video extremely_large_filesize has_audio mp4 hd hd_(traditional) " +
    "fhd voice_acted english_audio 3girls arms black_hair blue_eyes breasts clothed_female clothing dialogue face " +
    "female female_only freckles green_eyes grey_skin hairband hands indoors large_breasts light-skinned " +
    "light-skinned_female lips long_hair medium_breasts multiple_girls nail_polish neck orange_hair pale-skinned_female " +
    "pale_skin purple_eyes purple_hair red_hair short_hair teasing teeth";
t({
    genSettings: {
        "props": "tags",
        "lenLimit": -1,
    },
    propsObject: sankaku2,
    expected: tags1
});

t({
    genSettings: {
        "props": "tags",
        "lenLimit": -1,
        "limitType": "byte",
    },
    propsObject: sankaku2,
    expected: tags1
});

t({
    genSettings: {
        "props": "tags",
        "len-limit": -100,
        "limit-type": "char"
    },
    propsObject: sankaku2,
    expected: tags1
});


t({
    genSettings: {
        "props": "tag_string_artist tag_string_character tag_string_copyright tag_string_general tag_string_meta",
    },
    propsObject: safebooru,
    expected: "xingzhi_lv original abandoned architecture broken_window bush day east_asian_architecture forest grass house lantern"
});


t({
    genSettings: {
        "props": "tag_string_artist tag_string_character tag_string_copyright tag_string_general tag_string_meta",
        "ignore": ["original"]
    },
    propsObject: safebooru,
    expected: "xingzhi_lv abandoned architecture broken_window bush day east_asian_architecture forest grass house lantern nature path"
});


t({
    genSettings: {
        "props": "tag_string_artist tag_string_character tag_string_copyright tag_string_general tag_string_meta",
        "only": ["original"]
    },
    propsObject: safebooru,
    expected: "original"
});


t({
    genSettings: {
        "props": "tag_string_artist tag_string_character",
    },
    propsObject: sankaku3,
    expected: "hagiwara_studio barkkung101 nami_(one_piece) nico_robin"
});


t({
    genSettings: {
        "props": "  tag_string_character   tag_string_artist ",
    },
    propsObject: sankaku3,
    expected: "nami_(one_piece) nico_robin hagiwara_studio barkkung101"
});


t({
    genSettings: {
        "custom": {
            "tags__general": {
                "sources": ["tag_string_general"],
                "tagLimit": 3
            },
            "tags__artist": {
                "sources": ["tag_string_artist"],
                "tagLimit": 1
            },
        },
        "props": "tags__artist tags__general",
    },
    propsObject: sankaku3,
    expected: "hagiwara_studio 2girls abs bangs"
});


t({
    genSettings: {
        "custom": {
            "tags__example1": {
                "sources": ["tags_artist tag_string_general"],
                "tag-limit": 4
            },
            "tags__example2": {
                "sources": "tags_artist tag_string_general",
                "tag-limit": 2
            }
        },
        "props": "tags__example1 tags__example2",
        "dedup": false
    },
    propsObject: sankaku3,
    expected: "hagiwara_studio barkkung101 2girls abs hagiwara_studio barkkung101"
});


t({
    genSettings: {
        "custom": {
            "tags__example1": {
                "sources": ["tags_artist", "tag_string_general"],
                "tag-limit": 4
            },
            "tags__example2": {
                "sources": ["tags_artist"]
            }
        },
        "props": "tags__example1 tags__example2",
        "dedup": false
    },
    propsObject: sankaku1,
    expected: "nikita_varb 1girl bare_shoulders between_breasts nikita_varb"
});


t({
    genSettings: {
        "props": "tags_copyright",
        "onlyOne": []
    },
    propsObject: sankaku3,
    expected: "one_piece deviantart one_piece:_two_years_later"
});

t({
    genSettings: {
        "props": "tags_copyright",
        "onlyOne": [[]]
    },
    propsObject: sankaku3,
    expected: "one_piece deviantart one_piece:_two_years_later"
});

t({
    genSettings: {
        "props": "tags_copyright",
        "onlyOne": [
            ["one_piece"]
        ]
    },
    propsObject: sankaku3,
    expected: "one_piece deviantart one_piece:_two_years_later"
});

t({
    genSettings: {
        "props": "tags_copyright",
        "onlyOne": [
            ["one_piece:_two_years_later", "one_piece"]
        ]
    },
    propsObject: sankaku3,
    expected: "deviantart one_piece:_two_years_later"
});


t({
    genSettings: {
        "props": "tags",
        "onlyOne": [
            ["third-party_edit", "edit", "edited"],
            ["sound_edit", "edit", "edited"]
        ],
    },
    propsObject: {
        "tags": "blue third-party_edit white edit red"
    },
    expected: "blue third-party_edit white red"
});


t({
    propsObject: {
        "tags": "blue edited third-party_edit white edit red"
    },
    expected: "blue third-party_edit white red"
});
t({
    propsObject: {
        "tags": "blue edited white edit red"
    },
    expected: "blue white edit red"
});


t({
    propsObject: {
        "tags": "blue edited white red"
    },
    expected: "blue edited white red"
});


t({
    genSettings: {
        "custom": {
            "tags__example": {
                "sources": "tag_string_general",
                "only": "megane"
            },
        },
        "props": "tags__example",
        "replace": [
            ["megane", "glasses"]
        ]
    },
    propsObject: sankaku3,
    expected: "glasses"
});


t({
    genSettings: {
        "props": "tags",
        "joiner": ", ",
        "lenLimit": 10,
        "limitType": "byte"
    },
    propsObject: {
        "tags": ["にしてみた", "風景", "自然", "建物", "街並み", "背景", "original", "illustration"]
    },
    expected: "風景"
});

t({
    genSettings: {
        "props": "tags",
        "joiner": ", ",
        "lenLimit": 10,
    },
    propsObject: {
        "tags": ["にしてみた", "風景", "自然", "建物", "街並み", "背景", "original", "illustration"]
    },
    expected: "にしてみた, 風景"
});
t({
    genSettings: {
        "props": "tags",
        "joiner": ", ",
        "lenLimit": 10,
    },
    propsObject: {
        "tags": ["にしてみた", "風景", "自然", "建物", "街並み", "背景", "original", "illustration"]
    },
    expected: "にしてみた, 風景"
});


t({
    genSettings: {
        "props": "tags",
        "joiner": ", ",
        "lenLimit": 20,
        "limitType": "byte",
    },
    propsObject: {
        "tags": ["にしてみた", "風景", "自然", "建物", "街並み", "背景", "original", "illustration"]
    },
    expected: "にしてみた"
});

t({
    genSettings: {
        "props": "tags",
        "joiner": ", ",
        "lenLimit": 20,
    },
    propsObject: {
        "tags": ["にしてみた", "風景", "自然", "建物", "街並み", "背景", "original", "illustration"]
    },
    expected: "にしてみた, 風景, 自然, 建物"
});

t({
    genSettings: {
        "props": "tags",
        "joiner": ", ",
        "lenLimit": 30,
        "limitType": "byte",
    },
    propsObject: {
        "tags": ["にしてみた", "風景", "自然", "建物", "街並み", "背景", "original", "illustration"]
    },
    expected: "にしてみた, 風景"
});
t({
    genSettings: {
        "props": "tags",
        "joiner": ", ",
        "lenLimit": 30,
    },
    propsObject: {
        "tags": ["にしてみた", "風景", "自然", "建物", "街並み", "背景", "original", "illustration"]
    },
    expected: "にしてみた, 風景, 自然, 建物, 街並み, 背景"
});

// Using of non tag key as a tag
// "uploader" key must have no space character
t({
    genSettings: {
        "custom": {
            "spec-uploader-tag": {
                "sources": "uploader",
                "only": "user1"
            }
        },
        "props": "spec-uploader-tag tags",
    },
    propsObject: {
        "tags": "tag1 tag2 tag3 tag4",
        "uploader": "user1"
    },
    expected: "user1 tag1 tag2 tag3 tag4"
});
// With the other "uploader" key value
t({
    genSettings: {
        "custom": {
            "spec-uploader-tag": {
                "sources": "uploader",
                "only": "user1"
            }
        },
        "props": "spec-uploader-tag tags",
    },
    propsObject: {
        "tags": "tag1 tag2 tag3 tag4",
        "uploader": "user2"
    },
    expected: "tag1 tag2 tag3 tag4"
});

// Use top level `"split": false`
t({
    genSettings: {
        "split": false,
        "custom": {
            "spec-uploader-tag": {
                "sources": ["uploader"],
                "only": ["user 1"]
            }
        },
        "replace": [
            ["user 1", "user_1"]
        ],
        "ignore": ["tag4"],
        "props": ["spec-uploader-tag", "tags"]
    },
    propsObject: {
        "tags": ["tag1", "tag2", "tag3", "tag4"],
        "uploader": ["user 1"]
    },
    expected: "user_1 tag1 tag2 tag3"
});

// Use `"split": false` only in "custom"
t({
    genSettings: {
        "custom": {
            "spec-uploader-tag": {
                "sources": ["uploader"],
                "only": ["user 1"],
                "split": false
            }
        },
        "replace": [
            ["user 1", "user_1"]
        ],
        "ignore": ["tag4"],
        "props": ["spec-uploader-tag", "tags"]
    },
    propsObject: {
        "tags": ["tag1", "tag2", "tag3", "tag4"],
        "uploader": ["user 1"]
    },
    expected: "user_1 tag1 tag2 tag3"
});
t({
    genSettings: {
        "custom": {
            "spec-uploader-tag": {
                "sources": ["uploader"],
                "only": ["user 1"],
                "split": false
            }
        },
        "replace": [
            ["user 1", "user_1"]
        ],
        "ignore": "tag4",
        "props": "spec-uploader-tag tags"
    },
    propsObject: {
        "tags": "tag1 tag2 tag3 tag4",
        "uploader": "user 1"
    },
    expected: "user_1 tag1 tag2 tag3"
});


t({
    genSettings: {
        "props": "tags",
        "replace": [

        ]
    },
    propsObject: {
        "tags": "tag1 tag2 tag3 tag4"
    },
    expected: "tag1 tag2 tag3 tag4"
});
t({
    genSettings: {
        "props": "tags",
        "replace": [
            []
        ]
    },
    propsObject: {
        "tags": "tag1 tag2 tag3 tag4"
    },
    expected: "tag1 tag2 tag3 tag4"
});
t({
    genSettings: {
        "props": "tags",
        "replace": [
            ["tag1", "tag_1"]
        ]
    },
    propsObject: {
        "tags": "tag1 tag2 tag3 tag4"
    },
    expected: "tag_1 tag2 tag3 tag4"
});
t({
    genSettings: {
        "props": "tags",
        "replace": [
            ["tag1", "tag_1"],
            ["tag3", "tag_3"],
        ]
    },
    propsObject: {
        "tags": "tag1 tag2 tag3 tag4"
    },
    expected: "tag_1 tag2 tag_3 tag4"
});


t({
    genSettings: {
        "props": "not_exist_tags1 tags"
    },
    propsObject: sankaku2,
    expected: "teen_titans ben_10 the_incredibles raven_(dc) gwendolyn_tennyson violet_parr redmoa high_resolution english animated 3d"
});
t({
    genSettings: {
        "props": "not_exist_tags1 tags not_exist_tags2"
    },
    propsObject: sankaku2,
    expected: "teen_titans ben_10 the_incredibles raven_(dc) gwendolyn_tennyson violet_parr redmoa high_resolution english animated 3d"
});

[
{
    "props": "not_exist_tags1"
}, {
    "props": "not_exist_tags1 not_exist_tags2"
}, {
    "props": "  not_exist_tags1   not_exist_tags2  "
}, {
    "props": ["", "not_exist_tags1"]
}, {
    "props": ["  ", " "]
}, {
    "props": ""
}, {
    "props": ["", ""]
}, {
    "props": []
}, {
    // [empty]
}
].forEach(genSettings => {
    t({
        genSettings,
        propsObject: sankaku2,
        expected: ""
    });
});



const propsDemoObject1 = {
    "category": "example",
    "extension": "jpg",
    "filename": "7ad864fb2d2bc8bcd2cec9bec094e0fe",
    "id": 12345,
    "md5": "7ad864fb2d2bc8bcd2cec9bec094e0fe",
    "created_at": "2013-10-07T12:07:25.000-00:00",
    "uploader": "anonymous",
    "tag_string": "1girl brown_eyes brown_hair chair closed_mouth curly_hair dress extremely_high_resolution female grey_dress leonardo_da_vinci long_dress long_hair long_sleeves looking_at_viewer mona_lisa original sitting smile solo upper_body",
    "tag_string_artist": "leonardo_da_vinci",
    "tag_string_character": "mona_lisa",
    "tag_string_copyright": "original",
    "tag_string_general": "1girl brown_hair chair closed_mouth curly_hair dress female grey_dress long_dress long_hair long_sleeves looking_at_viewer sitting smile solo upper_body brown_eyes",
    "tag_string_meta": "extremely_high_resolution"
};

t({
    genSettings: {
        "props": "tag_string_artist tag_string_character tag_string_copyright tag_string_general tag_string_meta",
    },
    propsObject: propsDemoObject1,
    expected: "leonardo_da_vinci mona_lisa original 1girl brown_hair chair closed_mouth curly_hair dress female grey_dress long_dress"
});

t({
    genSettings: {
        "props": "tag_string_artist tag_string_character",
    },
    propsObject: propsDemoObject1,
    expected: "leonardo_da_vinci mona_lisa"
});
t({
    genSettings: {
        "props": ["tag_string_artist", "tag_string_character"],
    },
    propsObject: propsDemoObject1,
    expected: "leonardo_da_vinci mona_lisa"
});
t({
    genSettings: {
        "props": ["tag_string_artist tag_string_character", "tag_string_meta"],
    },
    propsObject: propsDemoObject1,
    expected: "leonardo_da_vinci mona_lisa extremely_high_resolution"
});
t({
    genSettings: {
        "props": ["  tag_string_artist  tag_string_character  ", "  tag_string_meta  "],
    },
    propsObject: propsDemoObject1,
    expected: "leonardo_da_vinci mona_lisa extremely_high_resolution"
});
t({
    genSettings: {
        "props": ["  tag_string_artist  tag_string_character    tag_string_meta  "],
    },
    propsObject: propsDemoObject1,
    expected: "leonardo_da_vinci mona_lisa extremely_high_resolution"
});


// The advanced usage:
// Keep "Animated" tag only if the extension is not "mp4", or "webm", or "gif".
const genSettingsOptionalAnimated = {
    "custom": {
        "__main_tags": {
            "sources": "tags",
            "ignore": "Animated"
        },
        "__extra_tags": {
            "sources": "extension tags",
            "only": "mp4 webm gif Animated"
        }
    },
    "onlyOne": [
        ["mp4", "webm", "gif", "Animated"]
    ],
    "ignore": "mp4 webm gif",
    "props": "__main_tags __extra_tags",
};
t({
    genSettings: genSettingsOptionalAnimated,
    propsObject: {
        "tags": "Animated 3D Overwatch Source_Filmmaker Tracer",
        "extension": "mp4"
    },
    expected: "3D Overwatch Source_Filmmaker Tracer"
});
t({
    genSettings: genSettingsOptionalAnimated,
    propsObject: {
        "tags": "3D Animated Overwatch Source_Filmmaker Tracer",
        "extension": "png"
    },
    expected: "3D Overwatch Source_Filmmaker Tracer Animated"
});

// Additionally let's move the "Source_Filmmaker" tag to the end
const genSettingsOptionalAnimatedWithSource_Filmmaker = {
    "custom": {
        "__main_tags": {
            "sources": "tags",
            "ignore": "Animated Source_Filmmaker"
        },
        "__extra_tags": {
            "sources": "extension tags",
            "only": "mp4 webm gif Animated Source_Filmmaker"
        }
    },
    "onlyOne": [
        ["mp4", "webm", "gif", "Animated"]
    ],
    "ignore": "mp4 webm gif",
    "props": "__main_tags __extra_tags",
};
t({
    genSettings: genSettingsOptionalAnimatedWithSource_Filmmaker,
    propsObject: {
        "tags": "Animated 3D Overwatch Source_Filmmaker Tracer",
        "extension": "mp4"
    },
    expected: "3D Overwatch Tracer Source_Filmmaker"
});
t({
    genSettings: genSettingsOptionalAnimatedWithSource_Filmmaker,
    propsObject: {
        "tags": "3D Animated Overwatch Source_Filmmaker Tracer",
        "extension": "png"
    },
    expected: "3D Overwatch Tracer Animated Source_Filmmaker"
});


t({
    genSettings: {
        "custom": {
            "__custom_tags_1": {
                "sources": "tags",
                "splitter": ", "
            }
        },
        "props": "__custom_tags_1",
        "joiner": ", "
    },
    propsObject: {
        "tags": "tag 1, tag 2, tag 3, tag 4"
    },
    expected: "tag 1, tag 2, tag 3, tag 4"
});

t({
    genSettings: {
        "custom": {
            "__custom_tags_1": {
                "sources": "tags",
                "splitter": ", ",
                "ignore": "tag 1"
            },
            "__custom_tags_2": {
                "sources": "tags",
                "splitter": ", ",
                "only": "tag 1"
            }
        },
        "props": "__custom_tags_1 __custom_tags_2",
        "joiner": ", "
    },
    propsObject: {
        "tags": "tag 1, tag 2, tag 3, tag 4"
    },
    expected: "tag 2, tag 3, tag 4, tag 1"
});

t({
    genSettings: {
        "splitter": ", ",
        "custom": {
            "__custom_tags_1": {
                "sources": "tags",
                "ignore": "tag 1"
            },
            "__custom_tags_2": {
                "sources": "tags",
                "only": "tag 1"
            }
        },
        "props": "__custom_tags_1, __custom_tags_2",
        "joiner": ", "
    },
    propsObject: {
        "tags": "tag 1, tag 2, tag 3, tag 4"
    },
    expected: "tag 2, tag 3, tag 4, tag 1"
});

// caseSens
// t({
//     genSettings: {
//         "caseSens": false,
//         "only": "tracer",
//         "props": "tags",
//     },
//     propsObject: {
//         "tags": "3D Animated Overwatch Source_Filmmaker Tracer"
//     },
//     expected: "tracer"
// });


