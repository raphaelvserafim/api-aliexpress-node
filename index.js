const puppeteer = require('puppeteer');

async function login() {
	// Inicializa o navegador
	const browser = await puppeteer.launch({
		headless: false, // set to false to show the browser window
		args: ["--no-sandbox", "--disable-setuid-sandbox"]
	});
	const page = await browser.newPage();


	// Vai para o AliExpress
	await page.goto('https://login.aliexpress.com');
	// desabilita verificação de webdriver
	await page.evaluateOnNewDocument(() => {
		Object.defineProperty(navigator, 'webdriver', {
			get: () => false 
		})
	});
	// digita email e senha
	await page.type('input[name=fm-login-id]', '');
	await page.type('input[name=fm-login-password]', '');
	// clica no botão de login
	await page.click('button.login-submit');

	// espera pelo desafio "Please slide to verify"
	await page.waitForSelector('.nc_iconfont.btn_slide');

	// encontra a posição do slider
	const slider = await page.$('.nc_iconfont.btn_slide');
	const sliderHandle = await slider.boundingBox();

	// move o cursor para o slider
	await page.mouse.move(sliderHandle.x + sliderHandle.width / 2, sliderHandle.y + sliderHandle.height / 2);
	await page.mouse.down();

	// move o cursor para a direita até completar o desafio
	await page.mouse.move(sliderHandle.x + sliderHandle.width, sliderHandle.y + sliderHandle.height / 2, { steps: 50 });
	await page.mouse.up();

	// espera até que a página carregue
	await page.waitForNavigation({
		waitUntil: 'load'
	});

	// verifica se o login foi bem sucedido
	const loginSuccess = await page.evaluate(() => {
		return document.querySelector('.next-breadcrumb-item') !== null;
	});

	if (loginSuccess) {
		console.log('Login realizado com sucesso!');
	} else {
		console.log('Falha ao realizar login, verifique seus dados de login.');

	}


}

login();