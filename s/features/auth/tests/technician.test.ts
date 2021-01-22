
import {Suite, assert} from "cynic"

import {makeLoginLink} from "../tools/emails/make-login-link.js"
import {testableSystem} from "./helpers/testable-system.js"
import {apiLink, platformLink} from "./helpers/constants.js"

import {Await} from "../../../types/fancy.js"

export default <Suite>{
	"sign up, login, and logout": async() => {
		const {system, getLatestLoginEmail} = await testableSystem()
		const browser = await system.mockBrowser()

		const grabAccess =
			(window: Await<ReturnType<typeof browser.mockAppWindow>>) =>
				window.frontend.authModel.getAccess()

		// signup
		const windowForSignup = await browser.mockAppWindow({
			apiLink,
			windowLink: platformLink,
			appToken: system.platformAppToken,
		})
		await windowForSignup.frontend.authModel.sendLoginLink(
			system.config.platform.technician.email
		)
		assert(
			await grabAccess(windowForSignup) === undefined,
			"windowA should start logged out"
		)

		// login
		const windowForLogin = await browser.mockAppWindow({
			apiLink,
			appToken: system.platformAppToken,
			windowLink: makeLoginLink({
				home: platformLink,
				loginToken: getLatestLoginEmail().loginToken,
			}),
		})
		assert(
			await grabAccess(windowForLogin),
			"windowB should now be logged in"
		)
		assert(
			await grabAccess(windowForSignup),
			"windowA should also be logged in"
		)

		// logout
		await windowForLogin.frontend.authModel.logout()
		assert(
			await grabAccess(windowForSignup) === undefined
				&& await grabAccess(windowForLogin) === undefined,
			"both windows should be logged out"
		)
	},

	"login to *any* app": true,
	"view platform stats": true,
	"procotol zero: roll platform secrets": true,
}
