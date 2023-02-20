const sleepAsync = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

const formatCsvCell = (s) => {
  return JSON.stringify(s);
};

const downloadCsv = (data, filename) => {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((item) =>
      headers.map((header) => formatCsvCell(item[header])).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv; charset=utf-8" });
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
};

const getQuery = (u) => {
  const url = new URL(u);
  const params = new URLSearchParams(url.search);
  const q = params.get("q");
  // console.log(q); // Output: "fpt software"
  return q;
};

const checkEndResults = (text) => {
  return text == "End of results" || text == "Đã hết kết quả";
};

const getFeedData = async () => {
  let feeds = document.querySelector("div[role=feed]");

  let retry = 0;
  let prevHeight = 0;

  while (!checkEndResults(feeds?.lastElementChild?.innerText) && retry < 4) {
    console.log(
      "scrolling",
      document.body.scrollHeight,
      retry
      //   feeds.lastElementChild.innerText
    );
    if (prevHeight == document.body.scrollHeight) {
      retry += 1;
    } else {
      prevHeight = document.body.scrollHeight;
      retry = 0;
    }
    window.scrollTo(0, document.body.scrollHeight);
    await sleepAsync(1000);
  }
  let res = [];
  feeds.querySelectorAll("div[role=article]").forEach((article) => {
    let listOfA = article.querySelectorAll("a");
    let a = listOfA[listOfA.length - 1];
    if (!a) return;
    let obj = { name: a.innerText, url: a.href, info: "" };
    let b = a;
    for (let i = 0; i < 5; i++) {
      b = b.parentElement;
      if ((b.nextElementSibling?.innerText || "").trim()) {
        obj.info = b.nextElementSibling?.innerText.trim();
        break;
      }
    }
    res.push(obj);
  });
  return res;
};

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.greeting == "fetchData") {
    let data = await getFeedData();
    console.log(data);
    downloadCsv(data, getQuery(document.URL) + ".csv");
    sendResponse("");
  }
});
