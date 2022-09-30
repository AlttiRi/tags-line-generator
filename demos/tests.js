import {TagsLineGenerator} from "../tags-line-generator.js";

import sankaku1  from "./jsons/sankaku-29652683.json"   assert {type: "json"};
import sankaku2  from "./jsons/sankaku-31250632.json"   assert {type: "json"};
import sankaku3  from "./jsons/sankaku-31113165.json"   assert {type: "json"};
import pixiv     from "./jsons/pixiv-78254724.json"     assert {type: "json"};
import safebooru from "./jsons/safebooru-5615470.json"  assert {type: "json"};
import paheal    from "./jsons/paheal-3864982.json"     assert {type: "json"};


let i = 0;
let tagsLineGen;
/** @param {{genSettings, propsObject, expected}} opts */
function t({genSettings, propsObject, expected}) {
    i++;
    const pad = " ".repeat(2 - i.toString().length);
    if (genSettings) {
        tagsLineGen = new TagsLineGenerator(genSettings);
    }

    const result = tagsLineGen.generateLine(propsObject);
    if (expected === undefined) {
        console.log(i, pad, result);
    } else {
        console.log(i, pad, result === expected);
    }
}


t({
    genSettings: {
        "selectedSets": ["tags"],
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
        "selectedSets": ["tag_string"],
        "tagsLimit": 3
    },
    propsObject: sankaku1,
    expected: "who_framed_roger_rabbit jessica_rabbit nikita_varb"
});



t({
    genSettings: {
        "selectedSets": ["tags"],
        "tagsLimit": 3
    },
    propsObject: paheal,
    expected: "Metal_Gear Metal_Gear_Solid_V Quiet"
});

t({
    genSettings: {
        "selected-sets": ["tags"],
        "tagsLimit": 3
    },
    propsObject: paheal,
    expected: "Metal_Gear Metal_Gear_Solid_V Quiet"
});


t({
    genSettings: {
        "selectedSets": ["tags"],
        "tagsLimit": 3,
        "joiner": ", ",
        "splitString": false
    },
    propsObject: pixiv,
    expected: "blue, Arknights 10000+ bookmarks, Arknights"
});


t({
    genSettings: {
        "selectedSets": "tag_string_artist tag_string_character",
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
        "selectedSets": "tag_string_artist tag_string_character",
        "charsLimit": 40
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
        "selectedSets": "tags",
        "charsLimit": 5
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
        "selectedSets": "tags",
        "charsLimit": 1
    },
    propsObject: sankaku2,
    expected: ""
});


t({
    genSettings: {
        "selectedSets": "tags",
        "charsLimit": 0 // or null === default (120)
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
        "selectedSets": "tags",
        "charsLimit": -1
    },
    propsObject: sankaku2,
    expected: tags1
});

t({
    genSettings: {
        "selectedSets": "tags",
        "bytesLimit": -1
    },
    propsObject: sankaku2,
    expected: tags1
});

t({
    genSettings: {
        "selectedSets": "tags",
        "bytesLimit": -100,
        "charsLimit": -100
    },
    propsObject: sankaku2,
    expected: tags1
});


t({
    genSettings: {
        "selectedSets": "tag_string_artist tag_string_character tag_string_copyright tag_string_general tag_string_meta",
    },
    propsObject: safebooru,
    expected: "xingzhi_lv original abandoned architecture broken_window bush day east_asian_architecture forest grass house lantern"
});


t({
    genSettings: {
        "selectedSets": "tag_string_artist tag_string_character tag_string_copyright tag_string_general tag_string_meta",
        "ignore": ["original"]
    },
    propsObject: safebooru,
    expected: "xingzhi_lv abandoned architecture broken_window bush day east_asian_architecture forest grass house lantern nature path"
});


t({
    genSettings: {
        "selectedSets": "tag_string_artist tag_string_character tag_string_copyright tag_string_general tag_string_meta",
        "only": ["original"]
    },
    propsObject: safebooru,
    expected: "original"
});


t({
    genSettings: {
        "selectedSets": "tag_string_artist tag_string_character",
    },
    propsObject: sankaku3,
    expected: "hagiwara_studio barkkung101 nami_(one_piece) nico_robin"
});


t({
    genSettings: {
        "selectedSets": "  tag_string_character   tag_string_artist ",
    },
    propsObject: sankaku3,
    expected: "nami_(one_piece) nico_robin hagiwara_studio barkkung101"
});


t({
    genSettings: {
        "customSets": {
            "tags__general": {
                "source": ["tag_string_general"],
                "tagsLimit": 3
            },
            "tags__artist": {
                "source": ["tag_string_artist"],
                "tagsLimit": 1
            },
        },
        "selectedSets": "tags__artist tags__general",
    },
    propsObject: sankaku3,
    expected: "hagiwara_studio 2girls abs bangs"
});


t({
    genSettings: {
        "customSets": {
            "tags__example1": {
                "source": ["tags_artist tag_string_general"],
                "tagsLimit": 4
            },
            "tags__example2": {
                "source": "tags_artist tag_string_general",
                "tagsLimit": 2
            }
        },
        "selectedSets": "tags__example1 tags__example2",
        "deduplicate": false
    },
    propsObject: sankaku3,
    expected: "hagiwara_studio barkkung101 2girls abs hagiwara_studio barkkung101"
});


t({
    genSettings: {
        "customSets": {
            "tags__example1": {
                "source": ["tags_artist", "tag_string_general"],
                "tagsLimit": 4
            },
            "tags__example2": {
                "source": ["tags_artist"]
            }
        },
        "selectedSets": "tags__example1 tags__example2",
        "deduplicate": false
    },
    propsObject: sankaku1,
    expected: "nikita_varb 1girl bare_shoulders between_breasts nikita_varb"
});


t({
    genSettings: {
        "selectedSets": "tags_copyright",
        onlyOne: []
    },
    propsObject: sankaku3,
    expected: "one_piece deviantart one_piece:_two_years_later"
});

t({
    genSettings: {
        "selectedSets": "tags_copyright",
        "onlyOne": [[]]
    },
    propsObject: sankaku3,
    expected: "one_piece deviantart one_piece:_two_years_later"
});

t({
    genSettings: {
        "selectedSets": "tags_copyright",
        "onlyOne": [
            ["one_piece"]
        ]
    },
    propsObject: sankaku3,
    expected: "one_piece deviantart one_piece:_two_years_later"
});

t({
    genSettings: {
        "selectedSets": "tags_copyright",
        "onlyOne": [
            ["one_piece:_two_years_later", "one_piece"]
        ]
    },
    propsObject: sankaku3,
    expected: "deviantart one_piece:_two_years_later"
});


t({
    genSettings: {
        "selectedSets": "tags",
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
        "customSets": {
            "tags__example": {
                "source": "tag_string_general",
                "only": "megane"
            },
        },
        "selectedSets": "tags__example",
        "replace": [
            ["megane", "glasses"]
        ]
    },
    propsObject: sankaku3,
    expected: "glasses"
});



