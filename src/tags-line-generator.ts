import {isString} from "@alttiri/util-js";
import {WildcardTagMatcher} from "./wildcard-tag-matcher.js";
import {
    CustomPropsOptionsObject, CustomPropsOptionsObjectExt,
    CustomPropOptions, CustomPropOptionsExt,
    LengthFunc, getLengthFuncResult, LimitType, ToArrayOpt,
    TagsLineGenSetting, PropsObject, CustomPropsObject,
    Tag, PropName, WordLine, WordList, WordCollection,
} from "./types.js";


export class TagsLineGenerator {
    private readonly tagLimit: number;
    private readonly lenLimit: number;
    private readonly len: LengthFunc;
    private readonly joiner:   string;
    private readonly splitter: string;
    private readonly split:   boolean;
    private readonly dedup:   boolean;
    // private readonly caseSens: boolean;
    private readonly customPropsOptionsObjectExt: CustomPropsOptionsObjectExt;
    private readonly props: PropName[];
    private readonly replace: Map<Tag, Tag>;
    private readonly onlyOne: Array<WordList<Tag>> | null;
    private readonly ignoreMatcher?: WildcardTagMatcher;
    private readonly onlyMatcher?:   WildcardTagMatcher;

    constructor(settings: TagsLineGenSetting) {
        this.tagLimit   = settings.tagLimit  || settings["tag-limit"]  || 0;
        const lenLimit  = settings.lenLimit  || settings["len-limit"]  || 120;
        const limitType = settings.limitType || settings["limit-type"] || "char";
        const {length, lengthLimit = lenLimit} = TagsLineGenerator.getLengthFunc(lenLimit, limitType);
        this.len = length;
        this.lenLimit = lengthLimit;

        this.joiner   = settings.joiner   || " ";
        this.splitter = settings.splitter || " ";
        this.split = settings.split ?? true;
        this.dedup = settings.dedup ?? true;

        // this.caseSens = settings.caseSens || settings["case-sens"] || false;

        this.props   = this.toArray(settings.props);
        this.replace = new Map(settings.replace);
        this.onlyOne = settings.onlyOne || settings["only-one"] || null;

        const customProps = settings.customProps || settings["custom-props"] || {};
        this.customPropsOptionsObjectExt = this.extendCustomSets(customProps);

        if (settings.only) {
            this.onlyMatcher = new WildcardTagMatcher(this.toArray(settings.only));
        } else
        if (settings.ignore) {
            this.ignoreMatcher = new WildcardTagMatcher(this.toArray(settings.ignore));
        }
    }

    generateLine(propsObject: PropsObject): WordLine<Tag> {
        const customPropsObject = this.getCustomPropsObject(propsObject);
        let tags: WordList<Tag> = this.props.flatMap(name => {
            if (propsObject[name] !== undefined) {
                return this.toArray(propsObject[name]);
            }
            return customPropsObject[name] || [];
        });

        if (this.dedup) {
            tags = [...new Set(tags)];
        }

        tags = this.removeByOnlyOneRule(tags);

        const resultTags = [];
        let currentLength = 0;
        const joinerLength = this.len(this.joiner);
        for (let tag of tags) {
            if (this.onlyMatcher && !this.onlyMatcher.match(tag)) {
                continue;
            } else
            if (this.ignoreMatcher && this.ignoreMatcher.match(tag)) {
                continue;
            }
            const replacer: Tag | undefined = this.replace.get(tag);
            if (replacer) {
                tag = replacer;
            }
            const tagLength = this.len(tag);
            const expectedLineLength = currentLength + tagLength + joinerLength * resultTags.length;
            if (expectedLineLength <= this.lenLimit) {
                resultTags.push(tag);
                currentLength += tagLength;
                if (this.tagLimit === resultTags.length) {
                    break;
                }
            }
        }

        return resultTags.join(this.joiner);
    }

    private removeByOnlyOneRule(tags: WordList<Tag>): WordList<Tag> {
        if (!this.onlyOne) {
            return tags;
        }
        const set = new Set(tags);
        for (const entryTags of this.onlyOne) {
            let removeNext = false;
            let to = entryTags.length - 1;
            for (let i = 0; i < to; i++) {
                if (set.has(entryTags[i])) {
                    if (removeNext) {
                        set.delete(entryTags[i]);
                    } else {
                        removeNext = true;
                        to = entryTags.length;
                    }
                }
            }
        }
        return [...set];
    }

    private getCustomPropsObject(propsObject: PropsObject): CustomPropsObject {
        const customPropsObject: CustomPropsObject = {};
        for (const [propName, opts] of Object.entries(this.customPropsOptionsObjectExt)) {
            let tags: WordList<Tag> = opts.props
                .flatMap((name: PropName): WordList<Tag> => {
                    return this.toArray(propsObject[name] || customPropsObject[name], opts);
                })
                .filter((tag: Tag) => {
                    if (opts.onlyMatcher && !opts.onlyMatcher.match(tag)) {
                        return false;
                    } else
                    if (opts.ignoreMatcher && opts.ignoreMatcher.match(tag)) {
                        return false;
                    }
                    return true;
                });

            if (opts.tagLimit && opts.tagLimit > 0) {
                tags = tags.slice(0, opts.tagLimit);
            }
            customPropsObject[propName] = tags;
        }

        return customPropsObject;
    }

    private extendCustomSets(customSets: CustomPropsOptionsObject): CustomPropsOptionsObjectExt {
        const customSetsExt: CustomPropsOptionsObjectExt = {};
        for (const [propName, opts] of Object.entries(customSets)) {
            customSetsExt[propName] = this.createSetsOptionsExt(opts);
        }
        return customSetsExt;
    }

    private createSetsOptionsExt(opts: CustomPropOptions): CustomPropOptionsExt {
        let ignoreMatcher, onlyMatcher;
        if (opts.only) {
            onlyMatcher = new WildcardTagMatcher(this.toArray(opts.only, opts));
        } else
        if (opts.ignore) {
            ignoreMatcher = new WildcardTagMatcher(this.toArray(opts.ignore, opts));
        }
        const tagLimit = opts.tagLimit || opts["tag-limit"];
        return {
            ...opts,
            props: this.toArray(opts.props, opts),
            ...(tagLimit !== undefined ? {tagLimit} : {}),
            ...(ignoreMatcher ? {ignoreMatcher} : {}),
            ...(onlyMatcher   ? {onlyMatcher}   : {}),
        };
    }

    private toArray(value?: WordCollection<string>, opt?: ToArrayOpt): WordList<string> {
        const split    = opt?.split ?? this.split;
        const splitter = opt?.splitter ?? this.splitter;
        if (!value) { // "" | undefined
            return [];
        }
        if (!split) {
            if (isString(value)) {
                return [value];
            }
            return value;
        }
        return TagsLineGenerator._toArray(value, splitter).filter(e => Boolean(e));
    }

    // The result should be filtered, since "animated   webm" -> ["animated", "", "webm"]
    private static _toArray(value: WordCollection<string>, splitter: string): WordList<string> {
        if (Array.isArray(value)) {
            return value.flatMap(value => value.split(splitter));
        }
        return value.split(splitter);
    }

    private static getLengthFunc(lenLimit: number, limitType: LimitType): getLengthFuncResult {
        if (lenLimit <= 0) {
            return {length: (_: string) => 0, lengthLimit: Number.MAX_SAFE_INTEGER};
        }
        if (limitType === "char") {
            return {length: (string: string) => string.length};
        } else
        if (limitType === "byte") {
            const te = new TextEncoder();
            return {length: (string: string) => te.encode(string).length};
        }
        throw new Error("Wrong LimitType"); // Unreachable. To pass TS check.
    }
}
