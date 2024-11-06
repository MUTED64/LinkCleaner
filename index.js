import cleanRules from "./clean-rules.js";

async function expandShortUrl(url) {
  const API_URL = `https://api.szfx.top/longurl/?url=${url}`;

  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data.orinalUrl;
  } catch (error) {
    throw error;
  }
}

async function cleanUrl(url, verbose = false) {
  let urlProcess = new URL(url);
  let rule;
  while ((rule = cleanRules.find((e) => e.match(urlProcess)))) {
    const urlBefore = urlProcess.toString();
    urlProcess = (await rule.clean(urlProcess)) || urlProcess;
    if (verbose)
      console.log(urlProcess.toString(), `(Clean rule: ${rule.name})`);
    if (urlBefore === urlProcess.toString()) break;
  }
  return urlProcess;
}

function copyToClipboard(resultText, copyNotification) {
  navigator.clipboard.writeText(resultText.textContent).then(() => {
    copyNotification.style.display = "block";
    setTimeout(() => {
      copyNotification.style.display = "none";
    }, 2000);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const inputText = document.getElementById("inputText");
  const cleanButton = document.getElementById("cleanButton");
  const loadingDiv = document.getElementById("loading");
  const resultDiv = document.getElementById("result");
  const resultText = document.getElementById("resultText");
  const copyButton = document.getElementById("copyButton");
  const copyNotification = document.getElementById("copyNotification");

  cleanButton.addEventListener("click", async () => {
    const text = inputText.value;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);

    if (!urls) {
      resultText.textContent = "输入中不存在URL。";
      resultDiv.style.display = "block";
      return;
    }

    loadingDiv.style.display = "block";
    resultDiv.style.display = "none";

    let processedText = text;
    for (const url of urls) {
      try {
        const expandedUrl = await expandShortUrl(url);
        const cleanedUrl = await cleanUrl(expandedUrl);
        processedText = processedText.replace(url, cleanedUrl);
      } catch (error) {
        console.error(`处理URL时出错: ${url}`, error);
      }
    }

    loadingDiv.style.display = "none";
    resultText.textContent = processedText;
    resultDiv.style.display = "block";
    copyToClipboard(resultText, copyNotification);
  });

  copyButton.addEventListener("click", () => {
    copyToClipboard(resultText, copyNotification);
  });
});
