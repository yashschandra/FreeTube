const puppeteer = require("puppeteer");

async function watch(videoID) {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--disable-features=site-per-process', '--start-maximized'],
        defaultViewport: null
    });
    browser.on('disconnected', async () => {
        await browser.close();
    });
    const page = await browser.newPage();
    page.on('framenavigated', async (frame) => {
        if (frame.url().includes('https://www.youtube.com/watch?')) {
            const params = new URL(frame.url()).searchParams;
            const vid = params.get('v');
            if (videoID === vid) {
                return;
            }
            await page.close();
            await watch(vid);
            await browser.close();
        }
    });
    await page.goto(`https://www.youtube.com/watch?v=${videoID}`);
    await page.waitForSelector('#movie_player', {visible: true});
    await page.click('#movie_player');
    await page.waitForSelector('.ytp-autonav-toggle-button-container', {visible: true});
    await page.click('.ytp-autonav-toggle-button-container');
}

async function main() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--disable-features=site-per-process', '--start-maximized'],
        defaultViewport: null
    });
    browser.on('disconnected', async () => {
        await browser.close();
    });
    const page = await browser.newPage();
    page.on('framenavigated', async (frame) => {
        if (frame.url().includes('https://www.youtube.com/watch?')) {
            const params = new URL(frame.url()).searchParams;
            const videoID = params.get('v');
            await page.close();
            await watch(videoID);
            await browser.close()
        }
    });
    await page.goto("https://www.youtube.com/");
}

main();
