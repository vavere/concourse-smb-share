
module.exports = function getStdin () {
	let ret = '';
	return new Promise(resolve => {
		if (process.stdin.isTTY) return resolve(ret);
		process.stdin.setEncoding('utf8')
		.on('readable', () => {
			let chunk;
			while ((chunk = process.stdin.read())) 
				ret += chunk;
		})
		.on('end', () => resolve(ret));
	});
};