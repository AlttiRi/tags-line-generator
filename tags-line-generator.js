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

        for (const opts of Object.values(this.customSets)) {
            for (const mod of ["only", "ignore"]) {
                if (opts[mod]) {
                    opts[mod] = TagsLineGenerator._splitWildcardTagsSet(opts[mod]);
                }
            }
        }
        if (settings.ignore) {
            this.ignore = TagsLineGenerator._splitWildcardTagsSet(settings.ignore);
        }
        if (settings.only) {
            this.only = TagsLineGenerator._splitWildcardTagsSet(settings.only);
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
            if (this.only) {
                const {specTagsSet, wildcardMatchers} = this.only;
                const hasMatch = specTagsSet.has(tag) || wildcardMatchers.some(matcher => matcher(tag));
                if (!hasMatch) {
                    continue;
                }
            } else
            if (this.ignore) {
                const {specTagsSet, wildcardMatchers} = this.ignore;
                const hasMatch = specTagsSet.has(tag) || wildcardMatchers.some(matcher => matcher(tag));
                if (hasMatch) {
                    continue;
                }
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
            if (opts.only) {
                for (const tag of sourceTags) {
                    const {specTagsSet, wildcardMatchers} = opts.only;
                    const hasMatch = specTagsSet.has(tag) || wildcardMatchers.some(matcher => matcher(tag));
                    if (!hasMatch) {
                        continue;
                    }
                    result.push(tag);
                }
            } else
            if (opts.ignore) {
                for (const tag of sourceTags) {
                    const {specTagsSet, wildcardMatchers} = opts.ignore;
                    const hasMatch = specTagsSet.has(tag) || wildcardMatchers.some(matcher => matcher(tag));
                    if (hasMatch) {
                        continue;
                    }
                    result.push(tag);
                }
            } else {
                result = sourceTags;
            }

            if (opts.tagsLimit) {
                result = result.slice(0, opts.tagsLimit);
            }
            customTagsMap.set(name, result);
        }

        return customTagsMap;
    }
    static _splitWildcardTagsSet(tagsSet) {
        const wildcards = [];
        const tags = [];
        for (const tag of tagsSet) {
            if (tag.startsWith("*") || tag.endsWith("*")) {
                wildcards.push(tag);
            } else {
                tags.push(tag)
            }
        }
        return {
            wildcardMatchers: [...new Set(wildcards)].map(wildcardTag => {
                return TagsLineGenerator._getWildcardMatcher(wildcardTag);
            }),
            specTagsSet: new Set(tags)
        };
    }
    static _getWildcardMatcher(wildcard) {
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
