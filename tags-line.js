export class TagsLine {
    constructor(settings = {}) {
        this.limit       = settings.limit       || 120;
        /** @type {"chars"|"bytes"} */
        this.limitType   = settings.limitType   || "chars";
        this.joiner      = settings.joiner      || " ";
        this.deduplicate = settings.deduplicate || true;

        this.selectedSets = settings.selectedSets || [];
        this.customSets   = settings.customSets   || {};
        this.ignore       = new Set(settings.ignore || []);

        this.length = TagsLine._getLengthFunc(this.limitType);
    }

    getLine(propsObject) {
        /** @type {Map<String, String[]>} */
        const customTagsMap = TagsLine._handleCustomTagsSets(propsObject, this.customSets);
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
                const onlyTags = new Set(opts.only);
                result = sourceTags.filter(tag => onlyTags.has(tag));

                // todo wildcards
            } else
            if (opts.ignore) {
                const {
                    tags: ignoreTags,
                    matchers: wildcardMatchers
                } = TagsLine._splitTagsSet(opts.ignore);

                for (const tag of sourceTags) {
                    if (ignoreTags.has(tag)) {
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
            matchers: [...new Set(wildcards)].map(wildcardTag => TagsLine._getWildcardMatcher(wildcardTag)),
            tags: new Set(tags)
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
