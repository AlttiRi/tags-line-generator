import {IWildcardTagMatcher, Tag, WildcardTag} from "./types.js";

type WildcardMatcher = (tag: Tag) => boolean;

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

    match(tag: Tag): boolean {
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
