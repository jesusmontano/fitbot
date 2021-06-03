import { getConfig } from './config';

const generateChallenge = async () => {
	const config = await getConfig();
	console.log(config);
};

export { generateChallenge };
