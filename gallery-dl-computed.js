import {ANSI_RED_BOLD} from "@alttiri/util-node-js";

const dumpJson1 = {
    "id": 29652683,
    "md5": "6ae32b1483fc6621dcbbbdb15144885d",
    "created_at": 1639478267,
    "extension": "jpg",
    "tags_artist": ["nikita_varb"],
    "tags_character": ["jessica_rabbit"],
    "tags_copyright": ["who_framed_roger_rabbit"],
    "tags_general": [
        "1girl","bare_shoulders","between_breasts","breasts","clavicle","cleavage","clothing","cocktail_dress","dress",
        "elbow_gloves","eyes_closed","eyeshadow","female","footwear","gloves","hair_over_one_eye","high_heels",
        "large_breasts","lipstick","makeup","microphone_stand","purple_gloves","red_dress","red_hair","red_lipstick",
        "shoes","solo","steam","strapless","strapless_dress","thighs"
    ],
    "tags_medium": ["high_resolution", "very_high_resolution", "large_filesize", "paid_reward"]
};


const json = dumpJson1;
// It looks that all properties are global available in extractor .py files, so:
globalThis.md5            = json.md5;
globalThis.id             = json.id;
globalThis.extension      = json.extension;
globalThis.tags_artist    = json.tags_artist;
globalThis.tags_character = json.tags_character;
globalThis.tags_copyright = json.tags_copyright;
globalThis.tags_medium    = json.tags_medium;
globalThis.tags_general   = json.tags_general;


// -------------
// Assume it's in gallery-dl.conf
const computedTagLineSetting = {
    "tags": ["tags_artist", "tags_character", "tags_copyright", "tags_general"],
    "limit": 130,           // "byteLimit": 120,
    "separator": " ",
    "formatter": "${tag}",  // applies to each tag
};
// -------------


// Here is the computed property
Object.defineProperty(globalThis, "computedTagLine", {
    get() {
        return computedTagLineSetting ? getComputedTagLine(computedTagLineSetting) : "";
    }
});

function getComputedTagLine({tags, limit, byteLimit, separator, formatter} = {}) {
    tags = tags || [];
    limit = limit || 100;
    separator = separator || " ";
    formatter = formatter || "${tag}";

    tags = tags.map(name => globalThis[name]);

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

            tag = formatStringSyntaxEmulation(formatter);

            function formatStringSyntaxEmulation(pattern) {
                return eval("`" + pattern + "`");
            }

            if (length(result) + length(separator) + length(tag) <= limit) {
                return result.length ? result + separator + tag : tag;
            }
            return result;
        }, "");
}




const filenamePatter = "{id}—{computedTagLine}—{md5}.{extension}";
console.log(filenamePatter);


const resolvedFilename = renderTemplateString(filenamePatter);
console.log(resolvedFilename);
console.log(resolvedFilename.length);




function renderTemplateString(template, props = globalThis) {
    let hasUndefined = false;
    const value = template.replaceAll(/{[^{}]+?}/g, (match, index, string) => {
        const value = props[match.slice(1, -1)];
        if (value === undefined) {
            console.log(ANSI_RED_BOLD(`[renderTemplateString] ${match} is undefined`));
            hasUndefined = true;
        }
        return value;
    });
    return {hasUndefined, value};
}
