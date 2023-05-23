import {WildcardTagMatcher} from "./wildcard-tag-matcher";

/**
 * The property object can have `any` properties,
 * but the selected keys (sources for `selectedSets`) must be `string`, or `string[]`.
 */
export type PropsObject = {
    [key: string]: any /*string | string[]*/,
};

export type TagsLineGenSetting = {
    /**
     * test
     */
    charsLimit?:  number, "chars-limit"?:  number,
    lengthLimit?: number, "length-limit"?: number,
    bytesLimit?:  number, "bytes-limit"?:  number,
    tagsLimit?:   number, "tags-limit"?:   number,

    joiner?:   string,
    splitter?: string,
    deduplicate?:   boolean,
    splitString?:   boolean, "split-string"?:   boolean,
    caseSensitive?: boolean, "case-sensitive"?: boolean,

    customSets?: CustomSets,           "custom-sets"?: CustomSets,
    selectedSets?: string | string[],  "selected-sets"?: string | string[],
    replace?: Array<[string, string]>,
    onlyOne?: Array<string[]> | null,  "only-one"?: Array<string[]> | null,

    ignore?: string | string[],
    only?:   string | string[],
};


export type SetsOptions = {
    source:  string | string[],
    only?:   string | string[],
    ignore?: string | string[],
    splitString?: boolean,
    splitter?:    string,
    tagsLimit?:   number,
};
export type CustomSets = {
    [key: string]: SetsOptions
};


/** @private */
export interface SetsOptionsExt extends SetsOptions {
    source: string[], // todo: rename to sources?
    ignoreMatcher?: WildcardTagMatcher,
    onlyMatcher?:   WildcardTagMatcher,
}
/** @private */
export type CustomSetsExt = {
    [key: string]: SetsOptionsExt
};

/** @private */
export type LimitType = "bytes" | "chars" | "unlimited";
/** @private */
export type LengthFunc = (text: string) => number;
/** @private */
export type ToArrayOpt = {
    splitString?: boolean, "split-string"?: boolean,
    splitter?: string
}
