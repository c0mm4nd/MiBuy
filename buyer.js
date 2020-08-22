const puppeteer = require('puppeteer');

const config = {
    user: 'MY_ACCOUNT', // WARNING: if you using phone number to login, make sure the phone number and your network(maybe proxy) in the same nation
    password: 'MY_PASSWORD',
    itemlink: 'https://www.mi.com/buy/detail?product_id=10000234', // For example: "https://item.mi.com/product/9372.html" - Mi9Pro
    thetime: 1600000000 * 1000 // https://shijianchuo.911cha.com/ helps you convert string to timestamp
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

    await page.goto(config.itemlink) // Mi8Naive (for test)

    // Before the time, should keep the login status
    for (;Date.now() < config.thetime;) {
        console.log("time for readying")
        ctx = await page.content()

        // check whether have we logged in
        if (await page.$('a.login') !== null) {
            console.log("clicking login...")
            // click login for cookie share auth
            await page.click("a.login")
        }

        // check whether can we add cart now
        if (await ctx.indexOf('J_proBuyBtn')!=-1) { 
            console.log("cannot find J_proBuyBtn, try add it to cart...")
            break 
        }

        if (config.thetime * 1000 - Date.now() > 5 * 60 * 1000) {
            // Need to login?
            if (ctx.indexOf('J_proLogin')!=-1) {
                await page.click('.J_proLogin')
                await page.waitForNavigation()
                ctx = await page.content()
            }
            
            /* Comment these because I dont find any agreement now. 22.08.2020 */
            // Need agreement? 
            // let agreement = await page.$('.J_agreeModal')
            // let classes = await page.$eval('.J_agreeModal', (el) =>{
            //     const classList = Array.from(el.classList);
            //     return JSON.stringify(classList);
            // })
            // console.log(classes)
            // if (classes.includes('modal-hide')) {
            //     await page.evaluate(_ => {
            //         window.scrollBy(0, window.innerHeight/3);
            //     });
            //     await page.click('.J_sure')
            //     await page.waitForNavigation()
            // }

            await sleep(5 * 60 * 1000)
        } else {
            // make sure the page refresh after  
            await sleep(config.thetime * 1000 - Date.now())
            await page.goto(config.itemlink)
        }
    }  

    // This step will add goods to cart
    // Mi maybe need to require input the captcha, do it by yourselves
    await page.click('a.btn.btn-primary')
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