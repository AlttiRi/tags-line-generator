const version = "2.0.0-2023.5.21";

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

interface SetsOptionsExt extends SetsOptions {
    source: string[], // todo: rename to sources?
    ignoreMatcher?: WildcardTagMatcher,
    onlyMatcher?:   WildcardTagMatcher,
}
type CustomSetsExt = {
    [key: string]: SetsOptionsExt
};

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


type Wildcard = `*${string}` | `${string}*` | `*${string}*`;
type WildcardMatcher = (text: string) => boolean;

class WildcardTagMatcher {
    private specTagsSet: Set<string>;
    private wildcardMatchers: WildcardMatcher[];
    constructor(tagsSet: string[]) {
        const wildcards: Wildcard[] = [];
        const tags: string[] = [];
        for (const tag of tagsSet) {
            if (WildcardTagMatcher._isWildcard(tag)) {
                wildcards.push(tag);
            } else {
                tags.push(tag);
            }
        }
        this.wildcardMatchers = [...new Set(wildcards)].map(wildcardTag => {
            return WildcardTagMatcher._getWildcardMatcher(wildcardTag);
        });
        this.specTagsSet = new Set(tags);
    }

    match(tag: string) {
        return this.specTagsSet.has(tag) || this.wildcardMatchers.some(matcher => matcher(tag));
    }

    static _isWildcard(value: string): value is Wildcard { // Simplified implementation
        return value.startsWith("*") || value.endsWith("*");
    }

    static _getWildcardMatcher(wildcard: Wildcard): WildcardMatcher { // Simplified implementation
        if (wildcard.startsWith("*") && wildcard.endsWith("*")) {
            const substring = wildcard.slice(1, -1);
            return (text: string) => text.includes(substring);
        }
        if (wildcard.startsWith("*")) {
            const substring = wildcard.slice(1);
            return (text: string) => text.endsWith(substring);
        }
        if (wildcard.endsWith("*")) {
            const substring = wildcard.slice(0, -1);
            return (text: string) => text.startsWith(substring);
        }
        throw new Error("Invalid input string: " + wildcard);
    }
}


type LimitType = "bytes" | "chars" | "unlimited";
type LengthFunc = (text: string) => number;

type ToArrayOpt = {
    splitString?: boolean, "split-string"?: boolean,
    splitter?: string
}


export class TagsLineGenerator {
    static readonly __version__ = version;
    private readonly charsLimit: number;
    private readonly bytesLimit: number;
    private readonly tagsLimit:  number;
    private readonly joiner:   string;
    private readonly splitter: string;
    private readonly splitString:   boolean;
    private readonly deduplicate:   boolean;
    private readonly caseSensitive: boolean;
    private readonly customSetsExt: CustomSetsExt;
    private readonly selectedSets: string[];
    private readonly replace: Map<string, string>;
    private readonly onlyOne: Array<string[]> | null;
    private readonly ignoreMatcher?: WildcardTagMatcher;
    private readonly onlyMatcher?:   WildcardTagMatcher;
    private readonly lengthLimit: number;
    private readonly limitType:  LimitType;
    private readonly calcLength: LengthFunc;

    constructor(settings: TagsLineGenSetting = {}) {
        // todo default source
        // todo lowercase
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
        this.calcLength = TagsLineGenerator._getLengthFunc(this.limitType);

        this.joiner      = settings.joiner      || " ";
        this.splitter    = settings.splitter    || " ";
        this.splitString = settings.splitString ?? settings["split-string"] ?? true;
        this.deduplicate = settings.deduplicate ?? true;

        this.caseSensitive = settings.caseSensitive || settings["case-sensitive"] || false;

        this.selectedSets = this.toArray(settings.selectedSets || settings["selected-sets"]);
        this.replace      = new Map(settings.replace);
        this.onlyOne      = settings.onlyOne    || settings["only-one"]     || null;

        const customSets  = settings.customSets || settings["custom-sets"]  || {};
        this.customSetsExt = this.extendCustomSets(customSets);

        if (settings.ignore) {
            this.ignoreMatcher = new WildcardTagMatcher(this.toArray(settings.ignore));
        }
        if (settings.only) {
            this.onlyMatcher = new WildcardTagMatcher(this.toArray(settings.only));
        }
    }

    generateLine(propsObject: PropsObject) {
        const customTagsMap = this._handleCustomTagsSets(propsObject);
        const sets: Array<string[]> = this.selectedSets.map(name => {
            if (propsObject[name] !== undefined) {
                return this.toArray(propsObject[name]);
            }
            return customTagsMap.get(name) || [];
        });

        let tags: Iterable<string> = sets.flat();
        if (this.deduplicate) {
            tags = new Set(tags);
        }

        tags = this._removeByOnlyOneRule(tags);

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
            const replacer: string | undefined = this.replace.get(tag);
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

    private createSetsOptionsExt(opts: SetsOptions): SetsOptionsExt {
        let ignoreMatcher, onlyMatcher;
        if (opts.ignore) {
            ignoreMatcher = new WildcardTagMatcher(this.toArray(opts.ignore, opts));
        }
        if (opts.only) {
            onlyMatcher = new WildcardTagMatcher(this.toArray(opts.only, opts));
        }
        return {
            ...opts,
            source: this.toArray(opts.source, opts),
            ...(ignoreMatcher ? {ignoreMatcher} : {}),
            ...(onlyMatcher   ? {onlyMatcher}   : {}),
        };
    }

    private extendCustomSets(customSets: CustomSets): CustomSetsExt {
        const customSetsExt: CustomSetsExt = {};
        for (const [key, opts] of Object.entries(customSets)) {
            customSetsExt[key] = this.createSetsOptionsExt(opts);
        }
        return customSetsExt;
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
            if (TagsLineGenerator.isString(value)) {
                return [value];
            }
            return value;
        }
        if (Array.isArray(value)) {
            return value.map(value => value.split(splitter)).flat();
        }
        return value.split(splitter);
    }

    private _removeByOnlyOneRule(tags: Iterable<string>): Iterable<string> {
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

    private _handleCustomTagsSets(propsObject: PropsObject): Map<string, string[]> {
        const customTagsMap: Map<string, string[]> = new Map();
        for (const [name, opts] of Object.entries(this.customSetsExt)) {
            const sourceTags: string[] = opts.source.map((name: string) => {
                return this.toArray(propsObject[name] || customTagsMap.get(name), opts);
            }).flat();

            let result: string[] = [];
            for (const tag of sourceTags) {
                if (opts.onlyMatcher && !opts.onlyMatcher.match(tag)) {
                    continue;
                } else
                if (opts.ignoreMatcher && opts.ignoreMatcher.match(tag)) {
                    continue;
                }
                result.push(tag);
            }
            if (opts.tagsLimit) {
                result = result.slice(0, opts.tagsLimit);
            }
            customTagsMap.set(name, result);
        }

        return customTagsMap;
    }

    private static _getLengthFunc(limitType: LimitType): LengthFunc {
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

    private static isString(value: unknown): value is string {
        return typeof value === "string" || value instanceof String;
    }
}

