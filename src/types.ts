import {WildcardTagMatcher} from "./wildcard-tag-matcher";

/** `Tag` is just a string */
export type Tag = string;
/** `TagLine` is a string of one or more `Tag`s separated by a separator (a space by default)*/
export type TagLine = `${Tag}`;
/** `TagList` is an array of `Tag`s */
export type TagList = Tag[];
/**
 * `TagListMixed` is an array of `Tag`s or/and `TagLine`s.
 * The `split` option of `TagsLineGenSetting`/`CustomPropsOptionsObject` must be set to `true` for the correct work.
 */
export type TagListMixed = Array<Tag | TagLine>;

/** `PropName` is the key of `PropsObject` is containing `TagLine`, or `TagList` */
export type PropName = string;
/** `PropNameList` is a string of one or more `PropName`s separated by a separator (a space by default)*/
export type PropNameLine = `${PropName}`;
/** `PropNameList` is an array of `PropName`s */
export type PropNameList = PropName[];
/**
 * It's similar to `TagListMixed`. Use with `split: true`.
 * @example
 * const a1: PropNameListMixed = ["a", "b", "c d e"];
 * const a2: PropName[] = ["a", "b", "c", "d", "e"];
 */
export type PropNameListMixed = Array<PropName | PropNameLine>;

/**
 * The property object can have `any` properties,
 * but the selected keys (sources for `selectedSets`) must be `string` (`TagLine`), or `string[]` (`TagList`), `TagListMixed`.
 */
export type PropsObject = {
    [key in PropName]: any | TagLine | TagList | TagListMixed
};

/**
 * The same as `PropsObject`,
 * but it is created automatically based on the input `PropsObject`
 * and rules described in `CustomPropsOptionsObject` of `TagsLineGenSetting`.
 * @private
 */
export type CustomPropsObject = {
    [key in PropName]: TagList
};

export type TagsLineGenSetting = {
    props: PropName | PropNameList | PropNameListMixed,
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
    onlyOne?: Array<TagList> | null, "only-one"?: Array<TagList> | null,

    only?:   TagLine | TagList | TagListMixed,
    ignore?: TagLine | TagList | TagListMixed,
};


export type CustomPropOptions = {
    sources: PropName | PropName[],
    only?:   TagLine | TagList | TagListMixed,
    ignore?: TagLine | TagList | TagListMixed,
    split?: boolean,
    splitter?: string,
    tagLimit?: number, "tag-limit"?: number,
};
/** @private */
export interface CustomPropOptionsExt extends Omit<CustomPropOptions, "tag-limit"> {
    source: TagList,
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
