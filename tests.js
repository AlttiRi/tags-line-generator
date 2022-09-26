import {TagsLineGenerator} from "./tags-line-generator.js";

import sankaku1  from "./jsons/sankaku-29652683.json"   assert {type: "json"};
import sankaku2  from "./jsons/sankaku-31250632.json"   assert {type: "json"};
import sankaku3  from "./jsons/sankaku-31113165.json"   assert {type: "json"};
import pixiv     from "./jsons/pixiv-78254724.json"     assert {type: "json"};
import safebooru from "./jsons/safebooru-5615470.json"  assert {type: "json"};
import paheal    from "./jsons/paheal-3864982.json"     assert {type: "json"};

let tagsLineGen;

tagsLineGen = new TagsLineGenerator({
    "selectedSets": ["tags"],
});
console.log(
    tagsLineGen.generateLine(sankaku1) ===
    "who_framed_roger_rabbit jessica_rabbit nikita_varb high_resolution very_high_resolution large_filesize paid_reward 1girl"
);
console.log(
    tagsLineGen.generateLine(paheal) ===
    "Metal_Gear Metal_Gear_Solid_V Quiet Vg_erotica animated webm"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": ["tag_string"],
    "tagsLimit": 3
});
console.log(
    tagsLineGen.generateLine(sankaku1) === "who_framed_roger_rabbit jessica_rabbit nikita_varb"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": ["tags"],
    "tagsLimit": 3
});
console.log(
    tagsLineGen.generateLine(paheal) === "Metal_Gear Metal_Gear_Solid_V Quiet"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": ["tags"],
    "tagsLimit": 3,
    "joiner": ", ",
    "splitString": false
});
console.log(
    tagsLineGen.generateLine(pixiv)
    === "blue, Arknights 10000+ bookmarks, Arknights"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tag_string_artist tag_string_character",
});
console.log(
    tagsLineGen.generateLine(sankaku2) === "redmoa raven_(dc) gwendolyn_tennyson violet_parr"
);
console.log(
    tagsLineGen.generateLine(sankaku3) === "hagiwara_studio barkkung101 nami_(one_piece) nico_robin"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tag_string_artist tag_string_character",
    "charsLimit": 40
});

console.log(
    tagsLineGen.generateLine(sankaku2) === "redmoa raven_(dc) gwendolyn_tennyson"
);
console.log(
    tagsLineGen.generateLine(sankaku3) === "hagiwara_studio barkkung101 nico_robin"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tags",
    "charsLimit": 5
});
console.log(
    tagsLineGen.generateLine(sankaku2) === "3d hd"
);
console.log(
    tagsLineGen.generateLine(sankaku3) === "3d"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tags",
    "charsLimit": 1
});
console.log(
    tagsLineGen.generateLine(sankaku2) === ""
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tags",
    "charsLimit": 0 // or null === default (120)
});
console.log(
    tagsLineGen.generateLine(sankaku2)
    === "teen_titans ben_10 the_incredibles raven_(dc) gwendolyn_tennyson violet_parr redmoa high_resolution english animated 3d"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tags",
    "charsLimit": -1
});
console.log(
    tagsLineGen.generateLine(sankaku2)
    === "teen_titans ben_10 the_incredibles raven_(dc) gwendolyn_tennyson violet_parr redmoa high_resolution english " +
    "16:9_aspect_ratio large_filesize animated 3d video extremely_large_filesize has_audio mp4 hd hd_(traditional) " +
    "fhd voice_acted english_audio 3girls arms black_hair blue_eyes breasts clothed_female clothing dialogue face " +
    "female female_only freckles green_eyes grey_skin hairband hands indoors large_breasts light-skinned " +
    "light-skinned_female lips long_hair medium_breasts multiple_girls nail_polish neck orange_hair pale-skinned_female " +
    "pale_skin purple_eyes purple_hair red_hair short_hair teasing teeth"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tag_string_artist tag_string_character tag_string_copyright tag_string_general tag_string_meta",
});
console.log(
    tagsLineGen.generateLine(safebooru)
    === "xingzhi_lv original abandoned architecture broken_window bush day east_asian_architecture forest grass house lantern"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tag_string_artist tag_string_character tag_string_copyright tag_string_general tag_string_meta",
    "ignore": ["original"]
});
console.log(
    tagsLineGen.generateLine(safebooru)
    === "xingzhi_lv abandoned architecture broken_window bush day east_asian_architecture forest grass house lantern nature path"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tag_string_artist tag_string_character tag_string_copyright tag_string_general tag_string_meta",
    "only": ["original"]
});
console.log(
    tagsLineGen.generateLine(safebooru)
    === "original"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tag_string_artist tag_string_character",
});
console.log(
    tagsLineGen.generateLine(sankaku3)
    === "hagiwara_studio barkkung101 nami_(one_piece) nico_robin"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": "  tag_string_character   tag_string_artist ",
});
console.log(
    tagsLineGen.generateLine(sankaku3)
    === "nami_(one_piece) nico_robin hagiwara_studio barkkung101"
);


tagsLineGen = new TagsLineGenerator({
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
});
console.log(
    tagsLineGen.generateLine(sankaku3)
    === "hagiwara_studio 2girls abs bangs"
);


tagsLineGen = new TagsLineGenerator({
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
});
console.log(
    tagsLineGen.generateLine(sankaku3)
    === "hagiwara_studio barkkung101 2girls abs hagiwara_studio barkkung101"
);

tagsLineGen = new TagsLineGenerator({
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
});
console.log(
    tagsLineGen.generateLine(sankaku1)
    === "nikita_varb 1girl bare_shoulders between_breasts nikita_varb"
);


tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tags_copyright",
    onlyOne: []
});
console.log(
    tagsLineGen.generateLine(sankaku3)
    === "one_piece deviantart one_piece:_two_years_later"
);

tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tags_copyright",
    "onlyOne": [[]]
});
console.log(
    tagsLineGen.generateLine(sankaku3)
    === "one_piece deviantart one_piece:_two_years_later"
);

tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tags_copyright",
    "onlyOne": [
        ["one_piece"]
    ]
});
console.log(
    tagsLineGen.generateLine(sankaku3)
    === "one_piece deviantart one_piece:_two_years_later"
);

tagsLineGen = new TagsLineGenerator({
    "selectedSets": "tags_copyright",
    "onlyOne": [
        ["one_piece:_two_years_later", "one_piece"]
    ]
});
console.log(
    tagsLineGen.generateLine(sankaku3)
    === "deviantart one_piece:_two_years_later"
);
