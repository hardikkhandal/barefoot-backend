const puppeteer = require("puppeteer");

async function scrapeTripAdvisor(location) {
  const url = `https://www.tripadvisor.com/Search?q=${encodeURIComponent(
    location
  )}&searchSessionId=`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const attractions = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll(".location-meta-block").forEach((element) => {
      const name =
        element.querySelector(".result-title")?.innerText || "No name";
      const rating =
        element
          .querySelector(".ui_bubble_rating")
          ?.getAttribute("class")
          ?.match(/bubble_(\d+)/)?.[1] / 10 || "No rating";
      const reviews =
        element.querySelector(".review-count")?.innerText || "No reviews";

      results.push({ name, rating, reviews });
    });
    return results;
  });

  await browser.close();
  return attractions;
}

scrapeTripAdvisor("Paris")
  .then((data) => console.log(data))
  .catch((err) => console.error("Error:", err));
