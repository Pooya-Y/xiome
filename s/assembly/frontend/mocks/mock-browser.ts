
import {mockRemote} from "./mock-remote.js"
import {assembleModels} from "../models/assemble-models.js"
import {SystemApi} from "../../backend/types/system-api.js"
import {mockModalSystem} from "../modal/mock-modal-system.js"
import {mockPopups} from "../connect/mock/common/mock-popups.js"
import {memoryFlexStorage} from "../../../toolbox/flex-storage/memory-flex-storage.js"
import {MockStripeOperations} from "../../../features/store/stripe2/types/mock-stripe-operations.js"
import {applyMockHacks} from "./apply-mock-hacks.js"

export async function mockBrowser({api, mockStripeOperations}: {
		api: SystemApi
		mockStripeOperations: MockStripeOperations
	}) {

	async function mockAppWindow({
			appId,
			apiLink,
			windowLink,
		}: {
			appId: string
			apiLink: string
			windowLink: string
		}) {

		const storage = memoryFlexStorage()
		const {remote, authMediator} = mockRemote({
			api,
			appId,
			apiLink,
			storage,
			origin: new URL(windowLink).origin,
		})

		const {nextModalResults} = mockModalSystem()
		const models = await assembleModels({
			appId,
			remote,
			storage,
			authMediator,
			popups: mockPopups({mockStripeOperations}),
		})

		return {models, remote, nextModalResults}
	}

	return {mockAppWindow}
}
