import {ANSI_RED_BOLD} from "@alttiri/util-node-js";

/**
 * @param {String} template
 * @param {Object} props
 * @return {{hasUndefined: boolean, value: string}}
 */
export function renderTemplateString(template, props) {
    let hasUndefined = false;
    const value = template.replaceAll(/{[^{}]+?}/g, (match, index, string) => {
        const key = match.slice(1, -1);
        const value = props[key];
        if (value === undefined) {
            console.log(ANSI_RED_BOLD(`[renderTemplateString] ${match} is undefined`));
            hasUndefined = true;
        }
        return value;
    });
    return {hasUndefined, value};
}

export function dateParts(date) {
    const d = new Date(date);
    const YYYY = d.getUTCFullYear();
    const MM = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const DD = d.getUTCDate().toString().padStart(2, "0");
    return {YYYY, MM, DD};
}
