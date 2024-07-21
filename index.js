import cleanRules from './clean-rules.js';


async function expandShortUrl(url) {
    const API_URL = `https://api.oioweb.cn/api/site/UrlRevert?url=${encodeURIComponent(url)}`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.result;
    } catch (error) {
        throw error;
    }
}

async function cleanUrl(url, verbose = false) {
    let urlProcess = new URL(url);
    let rule;
    while ((rule = cleanRules.find(e => e.match(urlProcess)))) {
        const urlBefore = urlProcess.toString();
        urlProcess = (await rule.clean(urlProcess)) || urlProcess;
        if (verbose) console.log(urlProcess.toString(), `(Clean rule: ${rule.name})`);
        if (urlBefore === urlProcess.toString()) break;
    }
    return urlProcess;
}

export { expandShortUrl, cleanUrl };