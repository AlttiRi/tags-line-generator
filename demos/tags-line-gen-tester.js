import {ANSI_BLUE, ANSI_CYAN, ANSI_GRAY, ANSI_GREEN_BOLD, ANSI_RED_BOLD} from "@alttiri/util-node-js";
import {TagsLineGenerator} from "../tags-line-generator.js";

function getLineNum(stackDeep = 2) {
    const errorLines = new Error().stack.split("\n");
    if (errorLines[0] === "Error") {
        errorLines.shift();
    }
    const match = errorLines[stackDeep]?.match(/\d+(?=:\d+$)/);
    return match?.[0] || "";
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
/** @type {TagsLineGenerator} */
let tagsLineGen;
let i = 0;
/** @param {{genSettings?: TagsLineGenSetting, propsObject, expected}} opts */
export function t({genSettings, propsObject, expected}) {
    const lineNum = getLineNum();

    i++;
    if (runOnly.length && !runOnly.includes(i)) {
        return;
    }
    const pad1 = " ".repeat(2 - i.toString().length);
    const pad2 = " ".repeat(3 - lineNum.toString().length);

    if (genSettings !== undefined) {
        tagsLineGen = new TagsLineGenerator(genSettings);
    }

    const result = tagsLineGen.generateLine(propsObject);
    if (expected === undefined) {
        console.log(ANSI_BLUE(i), pad1, ANSI_GRAY(lineNum), pad2, result);
    } else {
        const eq = result === expected;
        if (eq) {
            console.log(ANSI_GREEN_BOLD(i), pad1, ANSI_GRAY(lineNum), pad2, ANSI_GREEN_BOLD("passed"));
            passedTestCount++;
        } else {
            console.log(ANSI_RED_BOLD(i), pad1, ANSI_GRAY(lineNum), pad2, ANSI_RED_BOLD("failed"));
            console.log(ANSI_GRAY("expect: "), ANSI_CYAN(expected));
            console.log(ANSI_GRAY("result: "), result);
            printNotPassedTestLineRef && console.log(`file:///./tests.js:${lineNum}`);
            failedTestCount++;
        }
    }
    delayPrintTestResume();
}
