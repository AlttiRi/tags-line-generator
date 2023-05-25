import {isString} from "./util.js";
import {WildcardTagMatcher} from "./wildcard-tag-matcher.js";
import {
    CustomPropsOptionsObject, CustomPropsOptionsObjectExt,
    CustomPropOptions, CustomPropOptionsExt,
    LengthFunc, LimitType, ToArrayOpt,
    TagsLineGenSetting, PropsObject, CustomPropsObject,
    Tag, TagList, TagLine, PropName,
} from "./types.js";


export class TagsLineGenerator {
    private readonly charsLimit:  number;
    private readonly bytesLimit:  number;
    private readonly tagsLimit:   number;
    private readonly lengthLimit: number;
    private readonly limitType:  LimitType;
    private readonly calcLength: LengthFunc;
    private readonly joiner:   string;
    private readonly splitter: string;
    private readonly splitString:   boolean;
    private readonly deduplicate:   boolean;
    private readonly caseSensitive: boolean;
    private readonly customPropsOptionsObjectExt: CustomPropsOptionsObjectExt;
    private readonly selectedSets: PropName[];
    private readonly replace: Map<Tag, Tag>;
    private readonly onlyOne: Array<TagList> | null;
    private readonly ignoreMatcher?: WildcardTagMatcher;
    private readonly onlyMatcher?:   WildcardTagMatcher;

    constructor(settings: TagsLineGenSetting = {}) {
        this.charsLimit  = settings.charsLimit  || settings["chars-limit"]
                        || settings.lengthLimit || settings["length-limit"] || 120;
        this.bytesLimit  = settings.bytesLimit  || settings["bytes-limit"]  || 0;
        this.tagsLimit   = settings.tagsLimit   || settings["tags-limit"]   || 0;

        if (this.bytesLimit < 0 || this.charsLimit < 0) {
            this.limitType = "unlimited";
            this.lengthLimit = Number.MAX_SAFE_INTEGER;
        } else if (this.bytesLimit) {
            this.limitType = "bytes";
            this.lengthLimit = this.bytesLimit;
        } else {
            this.limitType = "chars";
            this.lengthLimit = this.charsLimit;
        }
        this.calcLength = TagsLineGenerator.getLengthFunc(this.limitType);

        this.joiner      = settings.joiner      || " ";
        this.splitter    = settings.splitter    || " ";
        this.splitString = settings.splitString ?? settings["split-string"] ?? true;
        this.deduplicate = settings.deduplicate ?? true;

        this.caseSensitive = settings.caseSensitive || settings["case-sensitive"] || false;

        this.selectedSets = this.toArray(settings.selectedSets || settings["selected-sets"]);
        this.replace      = new Map(settings.replace);
        this.onlyOne      = settings.onlyOne    || settings["only-one"]     || null;

        const customSets  = settings.customSets || settings["custom-sets"]  || {};
        this.customPropsOptionsObjectExt = this.extendCustomSets(customSets);

        if (settings.only) {
            this.onlyMatcher = new WildcardTagMatcher(this.toArray(settings.only));
        } else
        if (settings.ignore) {
            this.ignoreMatcher = new WildcardTagMatcher(this.toArray(settings.ignore));
        }
    }

    generateLine(propsObject: PropsObject): TagLine {
        const customPropsObject = this.getCustomPropsObject(propsObject);
        const tagSources: Array<TagList> = this.selectedSets.map(name => {
            if (propsObject[name] !== undefined) {
                return this.toArray(propsObject[name]);
            }
            return customPropsObject[name] || [];
        });

        let tags: TagList = tagSources.flat();
        if (this.deduplicate) {
            tags = [...new Set(tags)];
        }

        tags = this.removeByOnlyOneRule(tags);

        const resultTags = [];
        let currentLength = 0;
        const joinerLength = this.calcLength(this.joiner);
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
            const tagLength = this.calcLength(tag);
            const expectedLineLength = currentLength + tagLength + joinerLength * resultTags.length;
            if (expectedLineLength <= this.lengthLimit) {
                resultTags.push(tag);
                currentLength += tagLength;
                if (this.tagsLimit === resultTags.length) {
                    break;
                }
            }
        }

        return resultTags.join(this.joiner);
    }

    private removeByOnlyOneRule(tags: TagList): TagList {
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
            let tags: TagList = opts.source
                .flatMap((name: PropName) => {
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

            if (opts.tagsLimit) {
                tags = tags.slice(0, opts.tagsLimit);
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

        return {
            ...opts,
            source: this.toArray(opts.source, opts),
            ...(ignoreMatcher ? {ignoreMatcher} : {}),
            ...(onlyMatcher   ? {onlyMatcher}   : {}),
        };
    }

    private toArray(value?: string | string[], opt?: ToArrayOpt): string[] {
        const splitString = (opt?.splitString ?? opt?.["split-string"] ?? this.splitString);
        const splitter    = (opt?.splitter ?? this.splitter);
        return TagsLineGenerator._toArray(value, splitString, splitter).filter(e => Boolean(e));
    }

    private static _toArray(value: string | string[] | undefined, splitString: boolean, splitter: string): string[] {
        if (!value) {
            return [];
        }
        if (!splitString) {
            if (isString(value)) {
                return [value];
            }
            return value;
        }
        if (Array.isArray(value)) {
            return value.map(value => value.split(splitter)).flat();
        }
        return value.split(splitter);
    }

    private static getLengthFunc(limitType: LimitType): LengthFunc {
        if (limitType === "chars") {
            return (string: string) => string.length;
        } else
        if (limitType === "bytes") {
            const te = new TextEncoder();
            return (string: string) => te.encode(string).length;
        } else
        if (limitType === "unlimited") {
            return (_: string) => 0;
        }
        throw new Error("Wrong LimitType");
    }
}

