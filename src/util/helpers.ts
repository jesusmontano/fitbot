import { GenericMessageEvent, MessageEvent } from '@slack/bolt';

export const isGenericMessageEvent = (msg: MessageEvent): msg is GenericMessageEvent => {
	return (msg as GenericMessageEvent).subtype === undefined;
};

export const getRandomUser = (users: string[]): string => {
	return users[Math.floor(Math.random() * users.length)];
};

export const validateEnvs = (envNames: string[]) => {
	envNames.forEach((envName: string) => {
		if (process.env[envName] === '') {
			console.log(`Missing environment variable: ${envName}`);
			process.exit(1);
		}
	});
};
