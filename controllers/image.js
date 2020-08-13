const express = require("express");
const router = express.Router();
const puppeteer = require('puppeteer');
const download = require('image-downloader')
const path = require("path");
const root_dir = path.dirname(require.main.filename)
const fs = require('fs-extra')

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
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
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

//GET /images/download/:url
router.post("/download", (req, res) => {
    const savePath = path.join(root_dir + "/dist/crawled-images")
    const options = {
        url: req.body.url,
        dest: savePath
    }

    download.image(options)
        .then(({
            filename
        }) => {
            console.log('Saved image to', filename)
            res.download(filename)
        })
        .catch((err) => {
            console.error(err)
            next(err)
        })
})

router.post("/delete", (req, res) => {
    const filePath = path.join(root_dir + "/dist/crawled-images/" + req.body.fileName)
    fs.remove(filePath)
        .then(() => {
            console.log('Deletd file!', filePath)
            res.send("Delete success!")
        })
        .catch(err => {
            console.error(err)
            next(err)
        })
})

module.exports = router;