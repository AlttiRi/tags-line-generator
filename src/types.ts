import {WildcardTagMatcher} from "./wildcard-tag-matcher";

/** `Tag` is just a string. */
export type Tag = string;
/** `PropName` is the property name (key) of `PropsObject` is containing tags. */
export type PropName = string;

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
    props?: WordCollection<PropName>,
    customProps?: CustomPropsOptionsObject, "custom-props"?: CustomPropsOptionsObject,

    tagLimit?: number, "tag-limit"?: number,
    lenLimit?: number, "len-limit"?: number,
    limitType?: LimitType, "limit-type"?: LimitType,

    joiner?:   string,
    splitter?: string,
    dedup?: boolean,
    split?: boolean,
    caseSens?: boolean, "case-sens"?: boolean,

    replace?: Array<[Tag, Tag]>,
    onlyOne?: Array<WordList<Tag>> | null, "only-one"?: Array<WordList<Tag>> | null,

    only?:   WordCollection<Tag>,
    ignore?: WordCollection<Tag>,
};


export type CustomPropOptions = {
    sources: WordCollection<PropName>,
    only?:   WordCollection<Tag>,
    ignore?: WordCollection<Tag>,
    split?: boolean,
    splitter?: string,
    tagLimit?: number, "tag-limit"?: number,
};
/** @private */
export interface CustomPropOptionsExt extends Omit<CustomPropOptions, "tag-limit"> {
    sources: WordList<PropName>,
    ignoreMatcher?: WildcardTagMatcher,
    onlyMatcher?:   WildcardTagMatcher,
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
