import { WebClient, LogLevel } from '@slack/web-api';

const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
	logLevel: LogLevel.INFO,
});

export { client };
