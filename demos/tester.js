import {ANSI_BLUE, ANSI_CYAN, ANSI_GRAY, ANSI_GREEN_BOLD, ANSI_RED_BOLD} from "@alttiri/util-node-js";

/**
 * @param {number} stackDeep
 * @return {{filename?: string, line?: string, column?: string}}
 */
function getLineNum(stackDeep = 2) {
    const errorLines = new Error().stack.split("\n");
    if (errorLines[0] === "Error") {
        errorLines.shift();
    }
    const fileLine = errorLines[stackDeep]?.split("/").pop();
    const {filename, line, column} = fileLine?.match(/(?<filename>.+):(?<line>\d+):(?<column>\d+)/)?.groups || {};
    return {filename, line, column};
}

let passedTestCount = 0;
let failedTestCount = 0;
function printTestResume() {
    console.log(ANSI_GRAY("---------------"));
    const COLOR_PASS = passedTestCount ? ANSI_GREEN_BOLD : ANSI_GRAY;
    const COLOR_FAIL = failedTestCount ? ANSI_RED_BOLD : ANSI_GRAY;
    console.log(COLOR_PASS(passedTestCount.toString().padStart(8) + " passed"));
    console.log(COLOR_FAIL(failedTestCount.toString().padStart(8) + " failed"));
}
let timerId = null;
function delayPrintTestResume() {
    clearTimeout(timerId)
    timerId = setTimeout(printTestResume, 50);
}

/** @type {Number[]} */
const runOnly = [];
const printNotPassedTestLineRef = true;
let num = 0;
/** @param {{result, expected, stackDeep?}} opts */
export function t({result, expected, stackDeep}) {
    const {filename, line: lineNum} = getLineNum(2 + (stackDeep || 0));

    num++;
    if (runOnly.length && !runOnly.includes(num)) {
        return;
    }
    const pad1 = " ".repeat(2 - num.toString().length);
    const pad2 = " ".repeat(3 - lineNum.toString().length);

    if (expected === undefined) {
        console.log(ANSI_BLUE(num), pad1, ANSI_GRAY(lineNum), pad2, result);
    } else {
        const eq = result === expected;
        if (eq) {
            console.log(ANSI_GREEN_BOLD(num), pad1, ANSI_GRAY(lineNum), pad2, ANSI_GREEN_BOLD("passed"));
            passedTestCount++;
        } else {
            console.log(ANSI_RED_BOLD(num), pad1, ANSI_GRAY(lineNum), pad2, ANSI_RED_BOLD("failed"));
            console.log(ANSI_GRAY("expect: "), ANSI_CYAN(expected));
            console.log(ANSI_GRAY("result: "), result);
            printNotPassedTestLineRef && console.log(`file:///./${filename}:${lineNum}`); // Expects work dir === file location
            failedTestCount++;
        }
    }
    delayPrintTestResume();
}
