import {WildcardTagMatcher} from "./wildcard-tag-matcher";

/** `Tag` is just a string */
export type Tag = string;
/** `TagLine` is a string of one or more `Tag`s separated by a separator (a space by default)*/
export type TagLine = `${Tag}`;
/** `TagList` is an array of `Tag`s */
export type TagList = Tag[];

/** `PropName` is the key of `PropsObject` is containing `TagLine`, or `TagList` */
export type PropName = string;

/**
 * The property object can have `any` properties,
 * but the selected keys (sources for `selectedSets`) must be `string` (`TagLine`), or `string[]` (`TagList`).
 */
export type PropsObject = {
    [key in PropName]: any | TagLine | TagList
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
    props: PropName | PropName[],
    custom?: CustomPropsOptionsObject,

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

    only?:   TagLine | TagList,
    ignore?: TagLine | TagList,
};


export type CustomPropOptions = {
    sources: PropName | PropName[],
    only?:   TagLine | TagList,
    ignore?: TagLine | TagList,
    split?: boolean,
    splitter?: string,
    tagLimit?: number, "tag-limit"?: number,
};
/** @private */
export interface CustomPropOptionsExt extends CustomPropOptions {
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
