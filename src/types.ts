/** `Tag` is just a string. */
export type Tag = string;
/** `PropName` is the property name (key) of `PropsObject` is containing tags. */
export type PropName = string;

/** For partial tag matching. */
export type WildcardTag = `*${Tag}` | `${Tag}*` | `*${Tag}*`;
/**
 * The help class to check does the passed tag match any tag
 * of some `WordCollection` (passed to `constructor`) of `Tag`'s and/or `WildcardTag`'s.
 * With simple wildcard (`WildcardTag`) support.
 * @private
 */
export interface IWildcardTagMatcher {
    match(tag: Tag): boolean
}

/** `Word` represents either `Tag` or `PropName`. */
export type Word<T extends string> = T;
/**
 * A list (array) of `Word`s.
 * @example
 * const wList: WordList<string> = ["red", "green, "blue"];
 * */
export type WordList<T extends string> = Word<T>[];
/**
 * A string line of `Word`s separated by a separator (a space by default).
 * @example
 * const wLine: WordLine<string> = "red green blue";
 * */
export type WordLine<T extends string> = `${Word<T>}`;
/**
 * A list (array) of `Word`s and/or `WordLine`s. Use with `split: true`.
 * @example
 * const wlm: WordListMixed<string> = ["a", "b", "c d e"];
 * const wl: WordList<string> = ["a", "b", "c", "d", "e"];
 * */
export type WordListMixed<T extends string> = Array<Word<T> | WordLine<T>>;
/**
 * Collection of `Word` in any form. To make the user input more convenient.
 * (Instead of using the less convenient `WordList`.)
 * @example
 * const wc1: WordCollection<string> = "a b c d e";               // WordLine
 * const wc2: WordCollection<string> = ["a", "b", "c", "d", "e"]; // WordList
 * const wc3: WordCollection<string> = ["a b", "c", "d e"];       // WordListMixed
 */
export type WordCollection<T extends string> = WordLine<T> | WordList<T> | WordListMixed<T>;


/**
 * The property object can have `any` properties,
 * but the selected keys (sources for `selectedSets`) must be `WordCollection` (`string` or `string[]`).
 */
export type PropsObject = {
    [key in PropName]: any | WordCollection<PropName>
};

/**
 * The same as `PropsObject`,
 * but it is created automatically based on the input `PropsObject`
 * and rules described in `CustomPropsOptionsObject` of `TagsLineGenSetting`.
 * @private
 */
export type CustomPropsObject = {
    [key in PropName]: WordList<Tag>
};

export type TagsLineGenSetting = {
    /**
     * The list of property names (keys) of the props object `PropsObject` or/and custom props object `CustomPropsObject`.
     * The selected keys will be sources of the tags.
     * It allows to select only the required tag groups (sets) and order them.
     */
    props?: WordCollection<PropName>,

    /**
     * Contains the object with the rules how to create a custom props object.
     * Allows to create more specific tag sets based on the selected tag groups of the props object.
     * The property names of this object can (should) be used in `props`.
     */
    customProps?:    CustomPropsOptionsObject,
    /** Alias for `customProps`. */
    "custom-props"?: CustomPropsOptionsObject,


    /**
     * The max count of tags in the result tag line.
     * By default, unlimited (`0` or less number value).
     * @default 0
     */
    tagLimit?:    number,
    /** Alias for `tagLimit` */
    "tag-limit"?: number,

    /**
     * The max length of the result tag line. By default, it limits the count of chars.
     * @see `limitType`.
     * @default 120
     */
    lenLimit?:    number,
    /** Alias for `lenLimit` */
    "len-limit"?: number,

    /**
     * How `lenLimit` should limit the length of the tag line:
     * - based on character count (`"char"` value),
     * - based on byte size (`"char"` value).
     *
     * It doesn't matter to Windows, but Linux limits filenames based on the size of the filename string in bytes.
     * For example, "自然" is 2 characters, but 6 bytes long.
     * @default "char"
     * */
    limitType?:    LimitType,
    /** Alias for `limitType` */
    "limit-type"?: LimitType,


    /**
     * The joiner of the tags in the result string.
     * @default " "
     */
    joiner?:   string,
    /**
     * The string is used for splitting the input string is containing tags.
     * The string "1girl red_hair red_dress" will be split to ["1girl", "red_hair", "red_dress"] tag array.
     * @default " "
     */
    splitter?: string,
    /**
     * Use tag source splitting or not.
     * By default, it's `true` since usually booru's tags do not contain spaces
     * and separated by a space if tag source value is a tag string, not an array.
     * @default true
     * @see splitter
     */
    split?: boolean,

    /**
     * Remove the duplicate tags from the result tag line.
     * @default true
     */
    dedup?: boolean,

    /**
     * -- not implemented --
     * Case sensitive tag matching.
     * @default true
     */
    caseSens?: boolean,
    /** Alias for `caseSens` */
    "case-sens"?: boolean,

    /**
     * Replace the first tag (if exists) by the second one in the result tag line.
     * It's an array of arrays of 2 elements.
     * @example
     * replace: [
     *     ["megane", "glasses"],
     *     ["3d_art", "3d"]
     * ]
     */
    replace?: Array<[Tag, Tag]>,

    /**
     * If there are multiple similar tags in the result tag line, you can select the only one tag you need.
     * The first (left) tags are more preferable.
     * It's an array of arrays of 2 or more elements.
     * @example
     * onlyOne: [
     *     ["third-party_edit", "edit", "edited"],
     *     ["sound_edit", "edit", "edited"],
     *     ["3d", "3d_render"]
     * ]
     */
    onlyOne?:    Array<WordList<Tag>> | null,
    /** Alias for `onlyOne` */
    "only-one"?: Array<WordList<Tag>> | null,

    /** The list of tags that should only be added to the result tag line. */
    only?:   WordCollection<Tag | WildcardTag>,
    /** The list of tag which should not be added to the result tag line. */
    ignore?: WordCollection<Tag | WildcardTag>,
};


export type CustomPropOptions = {
    props:   WordCollection<PropName>,
    only?:   WordCollection<Tag | WildcardTag>,
    ignore?: WordCollection<Tag | WildcardTag>,
    split?: boolean,
    splitter?: string,
    tagLimit?: number, "tag-limit"?: number,
};
/** @private */
export interface CustomPropOptionsExt extends Omit<CustomPropOptions, "tag-limit"> {
    props: WordList<PropName>,
    ignoreMatcher?: IWildcardTagMatcher,
    onlyMatcher?:   IWildcardTagMatcher,
}

export type CustomPropsOptionsObject = Record<PropName, CustomPropOptions>;
/** @private */
export type CustomPropsOptionsObjectExt = Record<PropName, CustomPropOptionsExt>;

/** @private */
export type LimitType = "byte" | "char";
/** @private */
export type LengthFunc = (text: string) => number;
/** @private */
export type getLengthFuncResult = {
    length: LengthFunc,
    lengthLimit?: number,
};
/** @private */
export type ToArrayOpt = {
    split?: boolean,
    splitter?: string
}
