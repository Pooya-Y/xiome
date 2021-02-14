
import {apiContext} from "renraku/x/api/api-context.js"

import {appTopic} from "./topics/app-topic.js"
import {userTopic} from "./topics/user-topic.js"
import {loginTopic} from "./topics/login-topic.js"
import {bakeStatsHub} from "./tables/bake-stats-hub.js"
import {personalTopic} from "./topics/personal-topic.js"
import {appTokenTopic} from "./topics/app-token-topic.js"
import {bakeAuthTables} from "./tables/bake-auth-tables.js"
import {prepareAuthPolicies} from "./policies/prepare-auth-policies.js"
import {AnonMeta, AnonAuth, UserMeta, UserAuth, PlatformUserMeta, PlatformUserAuth, AuthOptions, AuthTables, GreenAuth, GreenMeta} from "./auth-types.js"

export const makeAuthApi = ({authTables, ...options}: AuthOptions & {
		authTables: AuthTables
	}) => {

	const {verifyToken, config} = options

	const policies = prepareAuthPolicies({
		verifyToken,
		getStatsHub: bakeStatsHub({authTables}),
		getAuthTables: bakeAuthTables({config, authTables}),
	})

	return {
		appTokenService: apiContext<GreenMeta, GreenAuth>()({
			policy: policies.green,
			expose: appTokenTopic(options),
		}),

		loginService: apiContext<AnonMeta, AnonAuth>()({
			policy: policies.anon,
			expose: loginTopic(options),
		}),
	
		appService: apiContext<PlatformUserMeta, PlatformUserAuth>()({
			policy: policies.platformUser,
			expose: appTopic(options),
		}),
	
		personalService: apiContext<UserMeta, UserAuth>()({
			policy: policies.user,
			expose: personalTopic(options),
		}),
	
		userService: apiContext<UserMeta, UserAuth>()({
			policy: policies.user,
			expose: userTopic(options),
		}),
	}
}
