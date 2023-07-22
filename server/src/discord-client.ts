import type { APIChannel, APIPartialGuild, APIEmbed, APIAllowedMentions, APIMessageReference, APIMessageComponent, Snowflake } from "discord-api-types/v10";
import fetch, { HeadersInit, RequestInit } from "node-fetch";

/**
 * Created from
 * https://discord.com/developers/docs/resources/channel#create-message
 */
interface APIMessage_Create {
	/**
	 * Message contents (up to 2000 characters)
	 */
	content?: string;
	/**
	 * Can be used to verify a message was sent (up to 25 characters). Value will appear in the Message Create event.
	 */
	nonce?: number | string;
	/** true if this is a TTS message */
	tts?: boolean;
	/** Up to 11 rich embeds (up to 6000 characters) */
	embeds?: APIEmbed[];
	/** Allowed mentions for the message */
	allowed_mentions?: APIAllowedMentions[];
	/** Include to make your message a reply */
	message_reference?: APIMessageReference;
	/** Components to include with the message */
	components?: APIMessageComponent[];
	/** IDs of up to 4 stickers in the server to send in the message */
	sticker_ids?: Snowflake[];
	/** Contents of the file being sent. See Uploading Files */
	"files[n]"?: unknown[];
	/** JSON-encoded body of non-file params, only for multipart/form-data requests. See Uploading Files */
	payload_json?: string;
	/** Attachment objects with filename and description. See Uploading Files */
	attachments?: unknown[];
	/** Message flags combined as a bitfield (only SUPPRESS_EMBEDS and SUPPRESS_NOTIFICATIONS can be set */
	flags?: number;
}

const BASIC_URL = "https://discord.com/api/v10";

const token = process.env.DISCORD_BOT_TOKEN || "";

if (token == "") {
	console.error("ERROR: env.DISCORD_BOT_TOKEN is undefined");
	process.exit(2);
}

/**
 * To learn more, refer to the documentation of the Discord API
 * https://discord.com/developers/docs/resources
 */
export class DiscordClientRestWrapper {
	token: string;

	constructor(token: string) {
		this.token = token;
	}

	private fetch(
		route: string,
		method: "GET" | "POST" = "GET",
		init?: RequestInit
	) {
		const headers: HeadersInit = {
			"Authorization": `Bot ${this.token}`,
		};

		if (method == "POST") {
			headers["Content-Type"] = "application/json";
		}

		return fetch(BASIC_URL.concat(route), {
			method,
			headers,
			...init,
		}).then((response) => {
			return response.json();
		});
	}

	private get<T>(route: string): Promise<T> {
		return this.fetch(route, "GET") as Promise<T>;
	}
	private post<T = Record<string, unknown>>(route: string, body: T) {
		return this.fetch(route, "POST", {
			body: JSON.stringify(body),
		});
	}

	guilds() {
		return this.get<APIPartialGuild[]>("/users/@me/guilds")
			.then((guilds) => {
				return guilds;
			})
			.catch((err) => {
				console.error(err);
			});
	}

	guildChannels(guildId: string) {
		return this.get<APIChannel[]>(`/guilds/${guildId}/channels`)
			.then((channels) => {
				return channels;
			})
			.catch((err) => {
				console.error(err);
			});
	}

	sendMessage(channelId: string, message: APIMessage_Create) {
		return this.post<APIMessage_Create>(`/channels/${channelId}/messages`, {
			tts: false,
			...message
		});
	}
}

const client = new DiscordClientRestWrapper(token);
export default client;
