import { getLoggerByFilename } from '../util/logger';
import { Logger } from 'log4js';

const log: Logger = getLoggerByFilename(__filename);

const logo = String.raw`
   ___  _  _    _             _     _      ___  
  / __\(_)| |_ | |__    ___  | |_  / |    / _ \ 
 / _\  | || __|| '_ \  / _ \ | __| | |   | | | |
/ /    | || |_ | |_) || (_) || |_  | | _ | |_| |
\/     |_| \__||_.__/  \___/  \__| |_|(_) \___/ 
by Jesus Montano and Jim Redfern`;

const showLogo = () => {
	log.info(logo);
};

export { showLogo };
