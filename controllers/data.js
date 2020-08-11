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



async function crawlData(url, listMappingFields) {
    console.log("URL", url)
    const browser = await puppeteer.launch();
    console.log("Browser opened")
    const page = await browser.newPage();
    // set user-agent to bypass capcha
    await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
    await page.goto(url);
    console.log("Page loaded")
    await autoScroll(page);
    console.log("Page scrolled to end")
    // register console.log to page.evaluate
    page.on('console', consoleObj => console.log(consoleObj.text()));

    const results = await page.evaluate((listMappingFields) => {

        function getAttribute(document, mappingField) {
            let elements = document.querySelectorAll(mappingField.selector);
            elements = [...elements]
            return elements.map(el => {
                if (mappingField.attribute == "innerText")
                    return el.innerText;
                else if (mappingField.attribute == "innerHTML")
                    return el.innerHTML;
                else
                    return el.getAttribute(mappingField.attribute)
            });;
        }

        function getMaxLength(listData) {
            let maxLength = 0;
            listData.map(v => {
                if (v.data.length > maxLength)
                    maxLength = v.data.length
            })

            return maxLength;
        }
        // create list data mapping with it's field
        function createListData(listMappingFields) {
            let listData = {};
            listMappingFields.map(v => {
                listData[v.field] = v;
            })
            return listData;
        }

        function combineData(listData, maxLength) {
            // create an array with maxLength element equal {}
            // let results = new Array(maxLength).fill({});
            let results = [];
            for (let i = 0; i < maxLength; i++) {
                results.push({})
            }
            for (let key in listData) {
                for (let i = 0; i < maxLength; i++) {
                    results[i][key] = listData[key].data[i]
                }
            }

            return results;
        }

        for (let v of listMappingFields) {
            v["data"] = getAttribute(document, v);
        }

        const listMapData = createListData(listMappingFields);
        const maxLength = getMaxLength(listMappingFields);
        console.log("Length: ", maxLength)
        const results = combineData(listMapData, maxLength);

        return results;
    }, listMappingFields)

    await browser.close();
    console.log("Browser closed")

    return results
}

// POST /images
router.post("/", async function (req, res) {
    const results = await crawlData(req.body.url, req.body.listMappingFields);
    res.send(results)
})

module.exports = router;