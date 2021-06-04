import { GenericMessageEvent, MessageEvent } from '@slack/bolt';

export const isGenericMessageEvent = (msg: MessageEvent): msg is GenericMessageEvent => {
	return (msg as GenericMessageEvent).subtype === undefined;
};
