
import {apiContext} from "renraku/x/api/api-context.js"

import {appTopic} from "./topics/app-topic.js"
import {userTopic} from "./topics/user-topic.js"
import {loginTopic} from "./topics/login-topic.js"
import {personalTopic} from "./topics/personal-topic.js"
import {appTokenTopic} from "./topics/app-token-topic.js"
import {permissionsTopic} from "./topics/permissions-topic.js"
import {manageAdminsTopic} from "./topics/manage-admins-topic.js"
import {prepareAuthPolicies} from "./policies/prepare-auth-policies.js"
import {AnonMeta, AnonAuth, UserMeta, UserAuth, PlatformUserMeta, PlatformUserAuth, UnconstrainedPlatformUserAuth, UnconstrainedPlatformUserMeta, AuthApiOptions, AuthTables, GreenAuth, GreenMeta, PermissionsTables, AppTables} from "./auth-types.js"

export const makeAuthApi = ({
			appTables,
			authTables,
			permissionsTables,
			...options
		}: AuthApiOptions & {
			appTables: AppTables
			authTables: AuthTables
			permissionsTables: PermissionsTables
		}) => {

	const {verifyToken, config} = options

	const policies = prepareAuthPolicies({
		config,
		appTables,
		authTables,
		permissionsTables,
		verifyToken,
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

		manageAdminsService: apiContext<
				UnconstrainedPlatformUserMeta,
				UnconstrainedPlatformUserAuth
			>()({
			policy: policies.unconstrainedPlatformUser,
			expose: manageAdminsTopic(options),
		}),
	
		personalService: apiContext<UserMeta, UserAuth>()({
			policy: policies.user,
			expose: personalTopic(options),
		}),
	
		userService: apiContext<UserMeta, UserAuth>()({
			policy: policies.user,
			expose: userTopic(options),
		}),

		permissionsService: apiContext<UserMeta, UserAuth>()({
			policy: policies.userWhoManagesPermissions,
			expose: permissionsTopic(options),
		}),
	}
}
