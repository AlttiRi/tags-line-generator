export class TagsLineGenerator {
    constructor(settings = {}) {
        this.charsLimit = settings.charsLimit  || 120;
        this.bytesLimit = settings.bytesLimit  || 0;
        this.tagsLimit  = settings.tagsLimit   || 0;

        this.joiner      = settings.joiner      || " ";
        this.deduplicate = settings.deduplicate || true;

        this.selectedSets = settings.selectedSets || [];
        this.customSets   = settings.customSets   || {};
        this.replace      = new Map(settings.replace);

        const WildcardTagMatcher = TagsLineGenerator.WildcardTagMatcher;
        for (const opts of Object.values(this.customSets)) {
            if (opts.ignore) {
                opts.ignore = new WildcardTagMatcher(opts.ignore);
            }
            if (opts.only) {
                opts.only = new WildcardTagMatcher(opts.only);
            }
        }
        if (settings.ignore) {
            this.ignore = new WildcardTagMatcher(settings.ignore);
        }
        if (settings.only) {
            this.only = new WildcardTagMatcher(settings.only);
        }

        if (this.bytesLimit > 0) {
            this.limitType = "bytes";
            this.lengthLimit = this.bytesLimit;
        } else {
            this.limitType = "chars";
            this.lengthLimit = this.charsLimit;
        }
        this.calcLength = TagsLineGenerator._getLengthFunc(this.limitType);

        //todo string input
    }

    computeLine(propsObject) {
        /** @type {Map<String, String[]>} */
        const customTagsMap = TagsLineGenerator._handleCustomTagsSets(propsObject, this.customSets);
        /** @type {Array<String[]>} */
        const sets = this.selectedSets.map(name => propsObject[name] || customTagsMap.get(name) || []);

        /** @type {Iterable<String>} */
        let tags = sets.flat();
        if (this.deduplicate) {
            tags = new Set(tags);
        }

        const resultTags = [];
        let currentLength = 0;
        const jL = this.calcLength(this.joiner);
        for (let tag of tags) {
            if (this.only && !this.only.match(tag)) {
                continue;
            } else
            if (this.ignore && this.ignore.match(tag)) {
                continue;
            }
            if (this.replace.has(tag)) {
                tag = this.replace.get(tag);
            }
            const tagLength = this.calcLength(tag);
            const expectedLineLength = currentLength + tagLength + jL * resultTags.length;
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

    static _handleCustomTagsSets(propsObject, customSets) {
        const customTagsMap = new Map();
        for (const [name, opts] of Object.entries(customSets)) {
            const sourceTags = propsObject[opts.source] || customTagsMap.get(opts.source);

            let result = [];
            for (const tag of sourceTags) {
                if (opts.only && !opts.only.match(tag)) {
                    continue;
                } else
                if (opts.ignore && opts.ignore.match(tag)) {
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
