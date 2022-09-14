export class TagsLineGenerator {
    constructor(settings = {}) {
        this.limit       = settings.limit       || 120;
        /** @type {"chars"|"bytes"} */
        this.limitType   = settings.limitType   || "chars";
        this.joiner      = settings.joiner      || " ";
        this.deduplicate = settings.deduplicate || true;

        this.selectedSets = settings.selectedSets || [];
        this.customSets   = settings.customSets   || {};
        this.ignore       = new Set(settings.ignore || []);

        for (const opts of Object.values(this.customSets)) {
            for (const mod of ["only", "ignore"]) {
                if (opts[mod]) {
                    opts[mod] = TagsLineGenerator._splitTagsSet(opts[mod]);
                }
            }
        }

        this.length = TagsLineGenerator._getLengthFunc(this.limitType);
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

        let tagsLine = "";
        for (const tag of tags) {
            if (this.ignore.has(tag)) {
                continue;
            }
            if (this.length(tagsLine + this.joiner + tag) <= this.limit) {
                tagsLine = tagsLine.length ? tagsLine + this.joiner + tag : tag;
            }
        }

        return tagsLine;
    }

    static _handleCustomTagsSets(propsObject, customSets) {
        const customTagsMap = new Map();
        for (const [name, opts] of Object.entries(customSets)) {
            const sourceTags = propsObject[opts.source] || customTagsMap.get(opts.source);

            let result = [];
            if (opts.only) {
                const {specTagsSet, wildcardMatchers} = opts.only;
                for (const tag of sourceTags) {
                    if (!specTagsSet.has(tag) && !wildcardMatchers.some(matcher => matcher(tag))) {
                        continue;
                    }
                    result.push(tag);
                }
            } else
            if (opts.ignore) {
                const {specTagsSet, wildcardMatchers} = opts.ignore;
                for (const tag of sourceTags) {
                    if (specTagsSet.has(tag)) {
                        continue;
                    }
                    if (wildcardMatchers.some(matcher => matcher(tag))) {
                        continue;
                    }
                    result.push(tag);
                }
            } else {
                result = sourceTags;
            }
            customTagsMap.set(name, result);
        }

        return customTagsMap;
    }
    static _splitTagsSet(tagsSet) {
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
