import {IWildcardTagMatcher, Tag, WildcardTag} from "./types";

type WildcardMatcher = (tag: Tag) => boolean;

/**
 * Allows to check does a tag match any tag of some set of tags (passed to `constructor`).
 * With simple wildcard support.
 *
 * @example
 * const wtm = new WildcardTagMatcher(["*_hair", "black_eyes"]);
 * wtm.match("white_hair"); // true
 * wtm.match("black_hair"); // true
 * wtm.match("black_eyes"); // true
 * wtm.match("blue_eyes");  // false
 * wtm.match("pink_dress"); // false
 */
export class WildcardTagMatcher implements IWildcardTagMatcher {
    private tags: Set<Tag>;
    private wildcardMatchers: WildcardMatcher[];

    constructor(inputTags: Array<Tag | WildcardTag>) {
        const wildcards: WildcardTag[] = [];
        const tags: Tag[] = [];
        for (const tag of inputTags) {
            if (WildcardTagMatcher.isWildcard(tag)) {
                wildcards.push(tag);
            } else {
                tags.push(tag);
            }
        }
        this.wildcardMatchers = [...new Set(wildcards)].map(wildcardTag => {
            return WildcardTagMatcher.getWildcardMatcher(wildcardTag);
        });
        this.tags = new Set(tags);
    }

    match(tag: Tag) {
        return this.tags.has(tag) || this.wildcardMatchers.some(matcher => matcher(tag));
    }

    private static isWildcard(value: Tag | WildcardTag): value is WildcardTag {
        return value.startsWith("*") || value.endsWith("*");
    }

    private static getWildcardMatcher(wildcard: WildcardTag): WildcardMatcher {
        if (wildcard.startsWith("*") && wildcard.endsWith("*")) {
            const substring = wildcard.slice(1, -1);
            return (tag: Tag) => tag.includes(substring);
        }
        if (wildcard.startsWith("*")) {
            const substring = wildcard.slice(1);
            return (tag: Tag) => tag.endsWith(substring);
        }
        if (wildcard.endsWith("*")) {
            const substring = wildcard.slice(0, -1);
            return (tag: Tag) => tag.startsWith(substring);
        }
        throw new Error("Invalid input string: " + wildcard); // Unreachable. To pass TS check.
    }
}
