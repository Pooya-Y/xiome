
import {AuthTables} from "../../tables/types/auth-tables.js"
import {AccessPayload} from "../../types/access-payload.js"
import {App} from "../../types/app.js"
import {PlatformConfig} from "../../types/platform-config.js"

export function isUserAllowedToEditProfile({app, access}: {
		app: App
		tables: AuthTables
		access: AccessPayload
		config: PlatformConfig
	}) {

	console.warn("TODO implement isUserAllowedToEditProfile")

	// TODO implement
	return true
}
