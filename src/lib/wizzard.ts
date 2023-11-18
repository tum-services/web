const wizzardName = [
    "Beurlaubung"
]

const wizzardRegexes = [
    /urlaub/
]

const checkForApplicableWizzard = (userMessage: string): number | undefined => {
    userMessage = userMessage.toLowerCase();
    for (let i = 0; i < wizzardRegexes.length; i++) {
        if (userMessage.match(wizzardRegexes[i])) {
            return i;
        }
    }
    return undefined;
}

export { wizzardName, checkForApplicableWizzard }