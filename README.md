# TagLineGenerator

This library allows you to generate a tag line based on the declarative rules described in JSON format.

It's mainly aimed for generating tag lines for using them in filenames when you download a content from online galleries.

## Hello World example

The expected input is an object with keys contain a set of tags (as a `string`, or `string[]` value) and some others _optional_ keys like this one:

```js
const propsObject = {    
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
```

_The props object `propsObject` are intended to be similar to a JSON response usually is returned by API._

The most simple use case is to order the tags by type — the most important tags are first (like `artist` and `character` types tags),
the less important ones are at the end.

Here is the generator's setting object for this case:
```js
const genSettings = {
    "props": "tag_string_artist tag_string_character tag_string_copyright tag_string_general tag_string_meta"
};
```

`props` option determines which tags sets should be used from `propsObject`. It's order sensitive.

The example of using `TagLineGenerator` class with the `propsObject` and `genSettings` variables above:

```js
const tagLineGen = new TagLineGenerator(genSettings);
const result = tagLineGen.generateLine(propsObject);
console.log(result);
```

The `result` is the follow `string`:
```js
"leonardo_da_vinci mona_lisa original 1girl brown_hair chair closed_mouth curly_hair dress female grey_dress long_dress"
```

Since it's aimed to be used for as a filename part, by default, the generator limits the result tag line length up to 120 characters.
The last tag are not cut. If some tag is too long to be fitted in the length limit the generator looks for the follow tags.

Once the `TagLineGenerator` is created, `generateLine` method can be used multiple times with the different props objects:

```js
const result2 = tagLineGen.generateLine(propsObject2);
console.log(result2);

const result3 = tagLineGen.generateLine(propsObject3);
console.log(result3);
```

It's recommended to reuse the same `TagLineGenerator` instance due to optimisations.

---



...

## todo: more complicated examples and describe API

...




---

The bonus config example:
```json
{
  "custom-props": {
    "tags__important": {
      "props": ["tags"],
      "only": ["third-party_edit", "sound_edit", "ai_generated", "artist_request"]
    },
    "tags__important_medium": {
      "props": ["tags_medium"],
      "only": ["3d"]
    },
    "tags__filtered_medium": {
      "props": ["tags_medium"],
      "ignore": ["*filesize", "*resolution", "*filesize", "*aspect_ratio", "hd", "fhd"]
    },
    "tags__custom_general": {
      "props": ["tags_general"]
    }
  },
  "ignore": ["tagme", "cg_art", "game_cg", "artist_cg", "webm", "mp4", "video", "animated"],
  "replace": [
    ["megane", "glasses"]
  ],
  "only-one": [
    ["third-party_edit", "edit"],
    ["sound_edit", "edit"],
    ["one_piece:_two_years_later", "one_piece"]
  ],
  "props": [
    "tags_artist", "tags__important", "tags_character", "tags_copyright", "tags_studio",
    "tags__important_medium",
    "tags__custom_general",
    "tags_genre", "tags__filtered_medium", "tags_meta"
  ],
  "len-limit": 110
}
```



### todo: describe that it does
