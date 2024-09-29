/*! TLG v3.1.0-2024.9.29 */
var TagsLineGenerator = (function () {
    'use strict';

    class WildcardTagMatcher {
        constructor(inputTags) {
            const wildcards = [];
            const tags = [];
            for (const tag of inputTags) {
                if (WildcardTagMatcher.isWildcard(tag)) {
                    wildcards.push(tag);
                }
                else {
                    tags.push(tag);
                }
            }
            this.wildcardMatchers = [...new Set(wildcards)].map(wildcardTag => {
                return WildcardTagMatcher.getWildcardMatcher(wildcardTag);
            });
            this.tags = new Set(tags);
        }
        match(tag) {
            return this.tags.has(tag) || this.wildcardMatchers.some(matcher => matcher(tag));
        }
        static isWildcard(value) {
            return value.startsWith("*") || value.endsWith("*");
        }
        static getWildcardMatcher(wildcard) {
            if (wildcard.startsWith("*") && wildcard.endsWith("*")) {
                const substring = wildcard.slice(1, -1);
                return (tag) => tag.includes(substring);
            }
            if (wildcard.startsWith("*")) {
                const substring = wildcard.slice(1);
                return (tag) => tag.endsWith(substring);
            }
            if (wildcard.endsWith("*")) {
                const substring = wildcard.slice(0, -1);
                return (tag) => tag.startsWith(substring);
            }
            throw new Error("Invalid input string: " + wildcard); // Unreachable. To pass TS check.
        }
    }

    function isString(value) {
        return typeof value === "string";
    }

    class TagsLineGenerator {
        constructor(settings) {
            this.tagLimit = settings.tagLimit || settings["tag-limit"] || 0;
            const lenLimit = settings.lenLimit || settings["len-limit"] || 120;
            const limitType = settings.limitType || settings["limit-type"] || "char";
            const { length, lengthLimit = lenLimit } = TagsLineGenerator.getLengthFunc(lenLimit, limitType);
            this.len = length;
            this.lenLimit = lengthLimit;
            this.joiner = settings.joiner || " ";
            this.splitter = settings.splitter || " ";
            this.split = settings.split ?? true;
            this.dedup = settings.dedup ?? true;
            // this.caseSens = settings.caseSens || settings["case-sens"] || false;
            this.props = this.toArray(settings.props);
            this.replace = new Map(settings.replace);
            this.onlyOne = settings.onlyOne || settings["only-one"] || null;
            const customProps = settings.customProps || settings["custom-props"] || {};
            this.customPropsOptionsObjectExt = this.extendCustomSets(customProps);
            if (settings.only) {
                this.onlyMatcher = new WildcardTagMatcher(this.toArray(settings.only));
            }
            else if (settings.ignore) {
                this.ignoreMatcher = new WildcardTagMatcher(this.toArray(settings.ignore));
            }
        }
        generateLine(propsObject) {
            const customPropsObject = this.getCustomPropsObject(propsObject);
            let tags = this.props.flatMap(name => {
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
                }
                else if (this.ignoreMatcher && this.ignoreMatcher.match(tag)) {
                    continue;
                }
                const replacer = this.replace.get(tag);
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
        getCustomPropsObject(propsObject) {
            const customPropsObject = {};
            for (const [propName, opts] of Object.entries(this.customPropsOptionsObjectExt)) {
                let tags = opts.props
                    .flatMap((name) => {
                    return this.toArray(propsObject[name] || customPropsObject[name], opts);
                })
                    .filter((tag) => {
                    if (opts.onlyMatcher && !opts.onlyMatcher.match(tag)) {
                        return false;
                    }
                    else if (opts.ignoreMatcher && opts.ignoreMatcher.match(tag)) {
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
        extendCustomSets(customSets) {
            const customSetsExt = {};
            for (const [propName, opts] of Object.entries(customSets)) {
                customSetsExt[propName] = this.createSetsOptionsExt(opts);
            }
            return customSetsExt;
        }
        createSetsOptionsExt(opts) {
            let ignoreMatcher, onlyMatcher;
            if (opts.only) {
                onlyMatcher = new WildcardTagMatcher(this.toArray(opts.only, opts));
            }
            else if (opts.ignore) {
                ignoreMatcher = new WildcardTagMatcher(this.toArray(opts.ignore, opts));
            }
            const tagLimit = opts.tagLimit || opts["tag-limit"];
            return {
                ...opts,
                props: this.toArray(opts.props, opts),
                ...(tagLimit !== undefined ? { tagLimit } : {}),
                ...(ignoreMatcher ? { ignoreMatcher } : {}),
                ...(onlyMatcher ? { onlyMatcher } : {}),
            };
        }
        toArray(value, opt) {
            const split = opt?.split ?? this.split;
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
        static _toArray(value, splitter) {
            if (Array.isArray(value)) {
                return value.flatMap(value => value.split(splitter));
            }
            return value.split(splitter);
        }
        static getLengthFunc(lenLimit, limitType) {
            if (lenLimit <= 0) {
                return { length: (_) => 0, lengthLimit: Number.MAX_SAFE_INTEGER };
            }
            if (limitType === "char") {
                return { length: (string) => string.length };
            }
            else if (limitType === "byte") {
                const te = new TextEncoder();
                return { length: (string) => te.encode(string).length };
            }
            throw new Error("Wrong LimitType"); // Unreachable. To pass TS check.
        }
    }

    return TagsLineGenerator;

})();
