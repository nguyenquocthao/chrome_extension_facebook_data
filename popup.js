document.getElementById("print-html").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { greeting: "fetchData" }, (response) => {
    console.log(5, response);
  });
});
