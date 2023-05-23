type Wildcard = `*${string}` | `${string}*` | `*${string}*`;
type WildcardMatcher = (text: string) => boolean;

export class WildcardTagMatcher {
    private specTagsSet: Set<string>;
    private wildcardMatchers: WildcardMatcher[];
    constructor(tagsSet: string[]) {
        const wildcards: Wildcard[] = [];
        const tags: string[] = [];
        for (const tag of tagsSet) {
            if (WildcardTagMatcher._isWildcard(tag)) {
                wildcards.push(tag);
            } else {
                tags.push(tag);
            }
        }
        this.wildcardMatchers = [...new Set(wildcards)].map(wildcardTag => {
            return WildcardTagMatcher._getWildcardMatcher(wildcardTag);
        });
        this.specTagsSet = new Set(tags);
    }

    match(tag: string) {
        return this.specTagsSet.has(tag) || this.wildcardMatchers.some(matcher => matcher(tag));
    }

    static _isWildcard(value: string): value is Wildcard { // Simplified implementation
        return value.startsWith("*") || value.endsWith("*");
    }

    static _getWildcardMatcher(wildcard: Wildcard): WildcardMatcher { // Simplified implementation
        if (wildcard.startsWith("*") && wildcard.endsWith("*")) {
            const substring = wildcard.slice(1, -1);
            return (text: string) => text.includes(substring);
        }
        if (wildcard.startsWith("*")) {
            const substring = wildcard.slice(1);
            return (text: string) => text.endsWith(substring);
        }
        if (wildcard.endsWith("*")) {
            const substring = wildcard.slice(0, -1);
            return (text: string) => text.startsWith(substring);
        }
        throw new Error("Invalid input string: " + wildcard);
    }
}
