const express = require("express");
const router = express.Router();
const puppeteer = require('puppeteer');

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function crawlImage(url, selector) {
    console.log("URL", url)
    console.log("SELECTOR", selector)
    const browser = await puppeteer.launch();
    console.log("Browser opened")
    const page = await browser.newPage();
    // set user-agent to bypass capcha
    await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
    await page.goto(url);
    console.log("Page loaded")
    await autoScroll(page);
    console.log("Page scrolled to end")

    const listImage = await page.evaluate((selector) => {
        let images = document.querySelectorAll(selector);
        images = [...images]
        const listImage = images.map(img => img.getAttribute("src"));
        return listImage;
    }, selector)

    await browser.close();
    console.log("Browser closed")

    return listImage
}

// POST /images
router.post("/", async function (req, res) {
    const listImage = await crawlImage(req.body.url, req.body.selector);
    res.send(listImage)
})

module.exports = router;