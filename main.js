const fs = require('fs');
const request = require('request-promise');

function readTokens(path) {
    const files = fs.readdirSync(path, { withFileTypes: true });
    const tokens = new Set();
    for (let file of files) {
        if (!file.isFile()) continue;
        let fileContents = fs.readFileSync(path + '/' + file.name, { encoding: 'utf-8' });
        let weightedTokensList = 
            fileContents
		.split('\n')
		.map(token => token.trim())
		.filter(token => (token != ''))
		.map(token => token.split(/\s+/))
		.map(l => [l[0], l.length < 2 ? 1 : parseInt(l[1])]);
	let weightsSum = weightedTokensList.reduce((a, v) => a + v[1], 0);
	if (weightsSum == 0.0) continue;
	let randomSum = Math.random() * weightsSum;
	let currentSum = 0.0;
	let i = 0;
	weightedTokensList.push([ undefined, 1 ]);
	for ( ; i < weightedTokensList.length && currentSum <= randomSum; ++i) {
            currentSum += weightedTokensList[i][1];
	}
        tokens.add(weightedTokensList[i - 1][0]);
    }
    return tokens;
}

async function setOnline(token) {
    let response = await request({
        uri: 'https://api.vk.com/method/account.setOnline',
        qs: {
            voip: '0',
            access_token: token,
            v: '5.101'
        },
        json: true
    });
    if (response.response == 1) {
        console.log('Online set for token ' + token.substr(0, 4) + '...');
    } else {
        console.log('Online set failed for token ' + token.substr(0, 4) + '...');
    }
}

function runOnce() {
    const tokens = readTokens('tokens');
    for (let token of tokens) {
	console.log(token);
	setOnline(token);
    }
}

runOnce();

setInterval(() => {
    runOnce();
}, 1000 * 60 * 3);
