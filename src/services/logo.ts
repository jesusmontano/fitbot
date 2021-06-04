import { getLoggerByFilename } from '../util/logger';
import { Logger } from 'log4js';

const log: Logger = getLoggerByFilename(__filename);

const showLogo = () => {
	log.info(
		'\n' +
			`     ___  _  _    _             _     _      ___      \n` +
			`    / __\\(_)| |_ | |__    ___  | |_  / |    / _ \\   \n` +
			`   / _\\  | || __|| '_ \\  / _ \\ | __| | |   | | | | \n` +
			`  / /    | || |_ | |_) || (_) || |_  | | _ | |_| |    \n` +
			`  \\/     |_| \\__||_.__/  \\___/  \\__| |_|(_) \\___/\n`,
		'by Jesus Montano and Jim Redfern',
	);
};

export { showLogo };
