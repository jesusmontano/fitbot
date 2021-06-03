const { App } = require('@slack/bolt');
require('dotenv').config();

// Initializes your app with your bot token and signing secret
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
	// Start your app
	await app.start(process.env.PORT || 3000);

	console.log('⚡️ Bolt app is running!');
	console.log(
		`     ___  _  _    _             _     _      ___   \n` +
			`    / __\\(_)| |_ | |__    ___  | |_  / |    / _ \\  \n` +
			`   / _\\  | || __|| '_ \\  / _ \\ | __| | |   | | | | \n` +
			`  / /    | || |_ | |_) || (_) || |_  | | _ | |_| | \n` +
			`  \\/     |_| \\__||_.__/  \\___/  \\__| |_|(_) \\___/ 	\n`,
	);
})();

export default {};
