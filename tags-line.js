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
        const customTagsMap = TagsLine._handleCustomTagsSets(propsObject, this.customSets);
        const sets = this.selectedSets.map(name => propsObject[name] || customTagsMap.get(name) || []);
        let tags = sets.flat();
        if (this.deduplicate) {
            tags = new Set(tags);
        }

        let result = "";
        for (const tag of tags) {
            if (this.ignore.has(tag)) {
                continue;
            }
            if (this.length(result + this.joiner + tag) <= this.limit) {
                result = result.length ? result + this.joiner + tag : tag;
            }
        }

        return result;
    }

    static _handleCustomTagsSets(propsObject, customSets) {
        const customTagsMap = new Map();
        for (const [name, opts] of Object.entries(customSets)) {
            const source = propsObject[opts.source] || customTagsMap.get(opts.source);

            let result = source;
            if (opts.only) {
                const onlyTags = new Set(opts.only);
                result = source.filter(tag => onlyTags.has(tag));

                // todo wildcards
            } else
            if (opts.ignore) {

                function splitTagsSet(tagsSet) {
                    const wildcards = [];
                    const tags = [];
                    for (const tag of tagsSet) {
                        if (tag.startsWith("*") || tag.endsWith("*")) {
                            wildcards.push(tag);
                        } else {
                            tags.push(tag)
                        }
                    }
                    return {wildcards: new Set(wildcards), tags: new Set(tags)};
                }

                const {
                    tags: ignoreTags,
                    wildcards: ignoreWTags
                } = splitTagsSet(opts.ignore);

                result = source.filter(tag => !ignoreTags.has(tag));

                for (const wildcard of ignoreWTags) {
                    const matcher = TagsLine._getWildcardMatcher(wildcard);
                    result = result.filter(tag => !matcher(tag));
                }

            }
            customTagsMap.set(name, result);
        }

        return customTagsMap;
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
