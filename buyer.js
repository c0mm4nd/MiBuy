const puppeteer = require('puppeteer');
const cheerio = require('cheerio')

const config = {
    user: 'YOUR_PHONE',
    password: 'YOUR_PASSWORD',
    itemlink: 'ITEM_LINK', // For example: "https://item.mi.com/product/9372.html" - Mi9Pro
    thetime: 1552010400 // https://shijianchuo.911cha.com/ help you convert string to timestamp
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 2000,
            height: 1000
        }
    });

    const page = await browser.newPage();

    // Login
    await page.goto('https://account.xiaomi.com');
    await page.type('input[name="user"]', config.user.toString());
    await page.type('input[name="password"]', config.password);
    await page.click('#login-button')
    await page.waitForNavigation()

    // Wait for time
    // await page.goto(''); // Mi9Pro
    await page.goto(config.itemlink) // Mi8Naive (for test)

    // Before the time, should keep the login status
    for (;Date.now() < config.thetime * 1000;) {

        if (config.thetime * 1000 - Date.now() > 5 * 60 * 1000) {
            ctx = await page.content()
            console.log(ctx)

            if (ctx.indexOf('J_proLogin')!=-1) {
                await page.click('.J_proLogin')
                await page.waitForNavigation()
                ctx = await page.content()
            }
            
            $ = cheerio.load(ctx)
            if ($('.J_agreeModal').hasClass('modal-hide')) {
                await page.evaluate(_ => {
                    window.scrollBy(0, window.innerHeight/3);
                });
                await page.click('.J_sure')
                await page.waitForNavigation()
            }

            await sleep(5 * 60 * 1000)
        }
    }  

    // This step will add goods to cart
    await page.click('.J_proBuyBtn')
    await page.waitForNavigation()

    // Goto cart to continue buying
    await page.goto('https://static.mi.com/cart/')
    await page.evaluate(_ => {
        window.scrollBy(0, window.innerHeight/3); // Move page to active the checkout button
    });
    await page.click("#J_goCheckout")
    await page.waitForNavigation()
    await page.evaluate(_ => {
        window.scrollBy(0, window.innerHeight/3); // Move page to active the checkout button
    });
    await page.click('#J_addressList > div.address-item.J_addressItem') // Choose address
    await page.click("#J_checkoutToPay") // checkout to pay

    // await page.content().then((ctx)=>{ console.log(ctx)})
})();