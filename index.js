const puppeteer = require("puppeteer");

let urls = [];

async function watch(videoID) {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--disable-features=site-per-process', '--start-maximized'],
        defaultViewport: null
    });
    browser.on('disconnected', async () => {
        await browser.close();
    });
    const pages = await browser.pages();
    const page = pages[0];
    page.on('framedetached', async (frame) => {
        if (frame.url().startsWith('https://www.youtube.com/watch')) {
            urls.pop();
        }
    });
    page.on('framenavigated', async (frame) => {
        if (frame.url().startsWith('https://www.youtube.com/')) {
            if (urls.length === 0 || frame.url() !== urls[urls.length-1]) {
                urls.push(frame.url());
            }
        }
        if (frame.url() === 'about:blank' && frame.parentFrame() === null && urls.length > 0) {
            urls.pop();
            if (urls.length === 0) {
                return;
            }
            const url = urls.pop();
            if (url.includes('https://www.youtube.com/watch?')) {
                const params = new URL(url).searchParams;
                const vid = params.get('v');
                await page.close();
                await watch(vid);
                await browser.close();
            } else {
                await page.goto(url);
            }
            return;
        }
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
    try {
        await page.goto(`https://www.youtube.com/watch?v=${videoID}`);
        await page.waitForSelector('#movie_player', {visible: true});
        await page.click('#movie_player');
        await page.waitForSelector('.ytp-autonav-toggle-button-container', {visible: true});
        await page.click('.ytp-autonav-toggle-button-container');
    } catch (e) {}
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
    const pages = await browser.pages();
    const page = pages[0];
    page.on('framedetached', async (frame) => {
        if (frame.url().startsWith('https://www.youtube.com/')) {
            urls.pop();
        }
    });
    page.on('framenavigated', async (frame) => {
        if (frame.url().startsWith('https://www.youtube.com/')) {
            if (urls.length === 0 || frame.url() !== urls[urls.length-1]) {
                urls.push(frame.url());
            }
        }
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
