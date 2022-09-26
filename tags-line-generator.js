export class TagsLineGenerator { // todo onlyOne: [str, str] // no camelcase // lengthLimit
    /** @typedef {Object<String, {
     * source: String|String[],
     * only?: String|String[],
     * ignore?: String|String[],
     * ignoreMatcher?: TagsLineGenerator.WildcardTagMatcher,
     * onlyMatcher?: TagsLineGenerator.WildcardTagMatcher,
     * tagsLimit?: number
     * }>} CustomSets */
    /** @typedef {{
     * charsLimit?: number,
     * bytesLimit?: number,
     * tagsLimit?: number,
     *
     * joiner?: string,
     * splitter?: string,
     * deduplicate?: boolean,
     * splitString?: boolean,
     *
     * customSets?: CustomSets,
     * selectedSets?: String|String[],
     * replace?: Array<[String, String]>,
     * onlyOne?: Array<String[]>|null,
     *
     * ignore?: String|String[],
     * only?: String|String[],
     * }} ComputedTagLineSetting */
    /** @param {ComputedTagLineSetting} settings */
    constructor(settings = {}) {
        this.charsLimit = settings.charsLimit   || 120;
        this.bytesLimit = settings.bytesLimit   || 0;
        this.initCharLimiter();
        this.tagsLimit  = settings.tagsLimit    || 0;

        this.joiner      = settings.joiner      || " ";
        this.splitter    = settings.splitter    || " ";
        this.splitString = settings.splitString ?? true;
        this.deduplicate = settings.deduplicate ?? true;

        /** @type {CustomSets|Object} */
        this.customSets   = settings.customSets || {};
        this.selectedSets = this.toArray(settings.selectedSets);
        this.replace      = new Map(settings.replace);
        this.onlyOne      = settings.onlyOne    || null;

        const WildcardTagMatcher = TagsLineGenerator.WildcardTagMatcher;
        for (const opts of Object.values(this.customSets)) {
            opts.source = this.toArray(opts.source);
            if (opts.ignore) {
                opts.ignoreMatcher = new WildcardTagMatcher(this.toArray(opts.ignore));
            }
            if (opts.only) {
                opts.onlyMatcher = new WildcardTagMatcher(this.toArray(opts.only));
            }
        }

        if (settings.ignore) {
            this.ignoreMatcher = new WildcardTagMatcher(this.toArray(settings.ignore));
        }
        if (settings.only) {
            this.onlyMatcher = new WildcardTagMatcher(this.toArray(settings.only));
        }
    }

    initCharLimiter() { // todo -1 for bytesLimit ???
        if (this.bytesLimit > 0) {
            this.limitType = "bytes";
            this.lengthLimit = this.bytesLimit;
        } else {
            this.limitType = "chars";
            this.lengthLimit = this.charsLimit >= 0 ? this.charsLimit : Number.MAX_SAFE_INTEGER;
        }
        this.calcLength = TagsLineGenerator._getLengthFunc(this.limitType);
    }

    /** @param {String|String[]} value */
    toArray(value) {
        if (!value) {
            return [];
        }
        if (Array.isArray(value)) {
            if (!this.splitString) {
                return value;
            }
            return value.map(value => value.split(this.splitter)).flat();
        }
        return value.split(this.splitter);
    }

    generateLine(propsObject) {
        /** @type {Map<String, String[]>} */
        const customTagsMap = this._handleCustomTagsSets(propsObject);
        /** @type {Array<String[]>} */
        const sets = this.selectedSets.map(name => {
            return this.toArray(propsObject[name] || customTagsMap.get(name));
        });

        /** @type {Iterable<String>} */
        let tags = sets.flat();
        if (this.deduplicate) {
            tags = new Set(tags);
        }

        let resultTags = [];
        let currentLength = 0;
        const joinerLength = this.calcLength(this.joiner);
        for (let tag of tags) {
            if (this.onlyMatcher && !this.onlyMatcher.match(tag)) {
                continue;
            } else
            if (this.ignoreMatcher && this.ignoreMatcher.match(tag)) {
                continue;
            }
            if (this.replace.has(tag)) {
                tag = this.replace.get(tag);
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

        resultTags = this._handleOnlyOne(resultTags);
        return resultTags.join(this.joiner);
    }

    _handleOnlyOne(tags) {
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

    _handleCustomTagsSets(propsObject) {
        const customTagsMap = new Map();
        for (const [name, opts] of Object.entries(this.customSets)) {
            /** @type {String[]} */
            const sourceTags = opts.source.map(name => {
                return this.toArray(propsObject[name] || customTagsMap.get(name));
            }).flat();

            let result = [];
            for (const tag of sourceTags) {
                if (opts.only && !opts.onlyMatcher.match(tag)) {
                    continue;
                } else
                if (opts.ignore && opts.ignoreMatcher.match(tag)) {
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
    static WildcardTagMatcher = class {
        /** @param {Array<String>} tagsSet */
        constructor(tagsSet) {
            const wildcards = [];
            const tags = [];
            for (const tag of tagsSet) {
                if (tag.startsWith("*") || tag.endsWith("*")) { // Simplified implementation
                    wildcards.push(tag);
                } else {
                    tags.push(tag);
                }
            }
            this.wildcardMatchers = [...new Set(wildcards)].map(wildcardTag => {
                return TagsLineGenerator.WildcardTagMatcher._getWildcardMatcher(wildcardTag);
            });
            this.specTagsSet = new Set(tags);
        }
        match(tag) {
            return this.specTagsSet.has(tag) || this.wildcardMatchers.some(matcher => matcher(tag));
        }
        static _getWildcardMatcher(wildcard) { // Simplified implementation
            if (wildcard.startsWith("*") && wildcard.endsWith("*")) {
                const substring = wildcard.slice(1, -1);
                return text => text.includes(substring);
            } else
            if (wildcard.startsWith("*")) {
                const substring = wildcard.slice(1);
                return text => text.endsWith(substring);
            } else
            if (wildcard.endsWith("*")) {
                const substring = wildcard.slice(0, -1);
                return text => text.startsWith(substring);
            }
        }
    }
    /** @param {"bytes"|"chars"} limitType */
    static _getLengthFunc(limitType) {
        if (limitType === "bytes") {
            const te = new TextEncoder();
            return function(string) {
                return te.encode(string).length;
            }
        }
        return function(string) {
            return string.length;
        }
    }
}
