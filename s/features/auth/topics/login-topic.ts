
import {asTopic} from "renraku/x/identities/as-topic.js"

import {AnonAuth} from "../policies/types/anon-auth.js"
import {find} from "../../../toolbox/dbby/dbby-mongo.js"
import {signAuthTokens} from "./login/sign-auth-tokens.js"
import {AuthApiOptions} from "../types/auth-api-options.js"
import {LoginPayload} from "../types/tokens/login-payload.js"
import {assertEmailAccount} from "./login/assert-email-account.js"
import {makePermissionsEngine} from "../../../assembly/backend/permissions2/permissions-engine.js"

export const loginTopic = ({
		rando,
		config,
		signToken,
		verifyToken,
		sendLoginEmail,
		generateNickname,
	}: AuthApiOptions) => asTopic<AnonAuth>()({

	async sendLoginLink(
			{access, tables},
			{email}: {email: string},
		) {
		const appRow = await tables.app.app.one(find({id_app: access.id_app}))
		const {id_user} = await assertEmailAccount({
			rando, email, config, tables, generateNickname,
		})
		await sendLoginEmail({
			appHome: appRow.home,
			appLabel: appRow.label,
			to: email,
			legalLink: config.platform.legalLink,
			platformLink: config.platform.appDetails.home,
			lifespan: config.crypto.tokenLifespans.login,
			loginToken: await signToken<LoginPayload>({
				payload: {id_user},
				lifespan: config.crypto.tokenLifespans.login,
			}),
		})
	},

	async authenticateViaLoginToken(
			{tables, access},
			{loginToken}: {loginToken: string},
		) {
		const {id_user} = await verifyToken<LoginPayload>(loginToken)
		const authTokens = await signAuthTokens({
			id_user,
			tables,
			scope: {core: true},
			id_app: access.id_app,
			origins: access.origins,
			lifespans: config.crypto.tokenLifespans,
			permissionsEngine: makePermissionsEngine({
				isPlatform: access.id_app === config.platform.appDetails.id_app,
				permissionsTables: tables.permissions,
			}),
			signToken,
			generateNickname,
		})

		await tables.user.latestLogin.update({
			...find({id_user}),
			upsert: {id_user, time: Date.now()},
		})

		return authTokens
	},

	// async authorizeAsUser(
	// 		{access, tables},
	// 		{scope, refreshToken}: {
	// 			scope: Scope
	// 			refreshToken: RefreshToken
	// 		}
	// 	) {
	// 	const {id_user} = await verifyToken<RefreshPayload>(refreshToken)
	// 	const {user, permit} = await fetchUserAndPermit({
	// 		id_user,
	// 		tables,
	// 		generateNickname,
	// 	})

	// 	await tables.user.latestLogin.update({
	// 		...find({id_user}),
	// 		upsert: {id_user, time: Date.now()},
	// 	})

	// 	return signToken<AccessPayload>({
	// 		lifespan: config.tokens.lifespans.access,
	// 		payload: {
	// 			user,
	// 			scope,
	// 			permit,
	// 			id_app: access.id_app,
	// 			origins: access.origins,
	// 		},
	// 	})
	// },
})
