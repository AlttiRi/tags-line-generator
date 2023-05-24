/*! TLG v2.0.5-2023.5.24 */
var TagsLineGenerator = (function () {
    'use strict';

    function isString(value) {
        return typeof value === "string" || value instanceof String;
    }

    class WildcardTagMatcher {
        constructor(tagsSet) {
            const wildcards = [];
            const tags = [];
            for (const tag of tagsSet) {
                if (WildcardTagMatcher._isWildcard(tag)) {
                    wildcards.push(tag);
                }
                else {
                    tags.push(tag);
                }
            }
            this.wildcardMatchers = [...new Set(wildcards)].map(wildcardTag => {
                return WildcardTagMatcher._getWildcardMatcher(wildcardTag);
            });
            this.specTagsSet = new Set(tags);
        }
        match(tag) {
            return this.specTagsSet.has(tag) || this.wildcardMatchers.some(matcher => matcher(tag));
        }
        static _isWildcard(value) {
            return value.startsWith("*") || value.endsWith("*");
        }
        static _getWildcardMatcher(wildcard) {
            if (wildcard.startsWith("*") && wildcard.endsWith("*")) {
                const substring = wildcard.slice(1, -1);
                return (text) => text.includes(substring);
            }
            if (wildcard.startsWith("*")) {
                const substring = wildcard.slice(1);
                return (text) => text.endsWith(substring);
            }
            if (wildcard.endsWith("*")) {
                const substring = wildcard.slice(0, -1);
                return (text) => text.startsWith(substring);
            }
            throw new Error("Invalid input string: " + wildcard);
        }
    }

    class TagsLineGenerator {
        constructor(settings = {}) {
            this.charsLimit = settings.charsLimit || settings["chars-limit"]
                || settings.lengthLimit || settings["length-limit"] || 120;
            this.bytesLimit = settings.bytesLimit || settings["bytes-limit"] || 0;
            this.tagsLimit = settings.tagsLimit || settings["tags-limit"] || 0;
            if (this.bytesLimit < 0 || this.charsLimit < 0) {
                this.limitType = "unlimited";
                this.lengthLimit = Number.MAX_SAFE_INTEGER;
            }
            else if (this.bytesLimit) {
                this.limitType = "bytes";
                this.lengthLimit = this.bytesLimit;
            }
            else {
                this.limitType = "chars";
                this.lengthLimit = this.charsLimit;
            }
            this.calcLength = TagsLineGenerator.getLengthFunc(this.limitType);
            this.joiner = settings.joiner || " ";
            this.splitter = settings.splitter || " ";
            this.splitString = settings.splitString ?? settings["split-string"] ?? true;
            this.deduplicate = settings.deduplicate ?? true;
            this.caseSensitive = settings.caseSensitive || settings["case-sensitive"] || false;
            this.selectedSets = this.toArray(settings.selectedSets || settings["selected-sets"]);
            this.replace = new Map(settings.replace);
            this.onlyOne = settings.onlyOne || settings["only-one"] || null;
            const customSets = settings.customSets || settings["custom-sets"] || {};
            this.customSetsExt = this.extendCustomSets(customSets);
            if (settings.only) {
                this.onlyMatcher = new WildcardTagMatcher(this.toArray(settings.only));
            }
            else if (settings.ignore) {
                this.ignoreMatcher = new WildcardTagMatcher(this.toArray(settings.ignore));
            }
        }
        generateLine(propsObject) {
            const customTagsMap = this.handleCustomTagsSets(propsObject);
            const sets = this.selectedSets.map(name => {
                if (propsObject[name] !== undefined) {
                    return this.toArray(propsObject[name]);
                }
                return customTagsMap.get(name) || [];
            });
            let tags = sets.flat();
            if (this.deduplicate) {
                tags = new Set(tags);
            }
            tags = this.removeByOnlyOneRule(tags);
            const resultTags = [];
            let currentLength = 0;
            const joinerLength = this.calcLength(this.joiner);
            for (let tag of tags) {
                if (this.onlyMatcher && !this.onlyMatcher.match(tag)) {
                    continue;
                }
                else if (this.ignoreMatcher && this.ignoreMatcher.match(tag)) {
                    continue;
                }
                const replacer = this.replace.get(tag);
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
        createSetsOptionsExt(opts) {
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
                ...(ignoreMatcher ? { ignoreMatcher } : {}),
                ...(onlyMatcher ? { onlyMatcher } : {}),
            };
        }
        extendCustomSets(customSets) {
            const customSetsExt = {};
            for (const [key, opts] of Object.entries(customSets)) {
                customSetsExt[key] = this.createSetsOptionsExt(opts);
            }
            return customSetsExt;
        }
        toArray(value, opt) {
            const splitString = (opt?.splitString ?? opt?.["split-string"] ?? this.splitString);
            const splitter = (opt?.splitter ?? this.splitter);
            return TagsLineGenerator._toArray(value, splitString, splitter).filter(e => Boolean(e));
        }
        static _toArray(value, splitString, splitter) {
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
        removeByOnlyOneRule(tags) {
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
                        }
                        else {
                            removeNext = true;
                            to = entryTags.length;
                        }
                    }
                }
            }
            return [...set];
        }
        handleCustomTagsSets(propsObject) {
            const customTagsMap = new Map();
            for (const [name, opts] of Object.entries(this.customSetsExt)) {
                const sourceTags = opts.source.map((name) => {
                    return this.toArray(propsObject[name] || customTagsMap.get(name), opts);
                }).flat();
                let result = [];
                for (const tag of sourceTags) {
                    if (opts.onlyMatcher && !opts.onlyMatcher.match(tag)) {
                        continue;
                    }
                    else if (opts.ignoreMatcher && opts.ignoreMatcher.match(tag)) {
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
        static getLengthFunc(limitType) {
            if (limitType === "chars") {
                return (string) => string.length;
            }
            else if (limitType === "bytes") {
                const te = new TextEncoder();
                return (string) => te.encode(string).length;
            }
            else if (limitType === "unlimited") {
                return (_) => 0;
            }
            throw new Error("Wrong LimitType");
        }
    }

    return TagsLineGenerator;

})();
