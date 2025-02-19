
// import {makeStoreModel} from "../../features/store/model/store-model.js"
import {AssembleModelsOptions} from "../types/assemble-models-options.js"
import {makeExampleModel} from "../../../features/example/models/example-model.js"
import {makeAppsModel} from "../../../features/auth/aspects/apps/models/apps-model.js"
import {makeQuestionsModel} from "../../../features/questions/model/questions-model.js"
import {makeAccessModel} from "../../../features/auth/aspects/users/models/access-model.js"
import {makeLivestreamModel} from "../../../features/livestream/models/livestream-model.js"
import {makePersonalModel} from "../../../features/auth/aspects/users/models/personal-model.js"
import {makeAdministrativeModel} from "../../../features/administrative/models/administrative-model.js"
import {makePermissionsModel} from "../../../features/auth/aspects/permissions/models/permissions-model.js"

export async function assembleModels({
		appId,
		remote,
		popups,
		storage,
		authMediator,
	}: AssembleModelsOptions) {

	const accessModel = makeAccessModel({
		authMediator,
		loginService: remote.auth.users.loginService,
	})

	const {getAccessOp, getAccess, getValidAccess, reauthorize} = accessModel

	const exampleModel = makeExampleModel({getAccessOp})

	const personalModel = makePersonalModel({
		personalService: remote.auth.users.personalService,
		getAccessOp,
		reauthorize,
	})

	const appsModel = makeAppsModel({
		appService: remote.auth.apps.appService,
		appEditService: remote.auth.apps.appEditService,
		getValidAccess,
	})

	const permissionsModel = makePermissionsModel({
		permissionsService: remote.auth.permissions.permissionsService,
		reauthorize,
	})

	const livestreamModel = makeLivestreamModel({
		...remote.livestream,
		getAccessOp,
	})

	// // TODO reactivate store
	// const storeModel = makeStoreModel({
	// 	appId,
	// 	storage,
	// 	shopkeepingService: remote.store.shopkeepingService,
	// 	stripeAccountsService: remote.store.stripeConnectService,
	// 	statusCheckerService: remote.store.ecommerce.statusCheckerService,
	// 	statusTogglerService: remote.store.ecommerce.statusTogglerService,
	// 	triggerBankPopup: popups.triggerBankPopup,
	// })

	const administrativeModel = makeAdministrativeModel({
		roleAssignmentService: remote.administrative.roleAssignmentService,
		reauthorize: () => accessModel.reauthorize(),
	})

	const questionsModel = makeQuestionsModel({
		...remote.questions,
		getAccess: getAccessOp,
	})

	accessModel.subscribe(async({accessOp}) => {
		const access = getAccess()
		await Promise.all([
			exampleModel.updateAccessOp(accessOp),
			personalModel.updateAccessOp(accessOp),
			livestreamModel.updateAccessOp(accessOp),
			appsModel.updateAccessOp(accessOp),
			permissionsModel.updateAccessOp(accessOp),
			questionsModel.accessChange(access),
			administrativeModel.updateAccessOp(accessOp),
			// storeModel.accessChange(access),
		])
	})

	return {
		exampleModel,
		appsModel,
		accessModel,
		// storeModel,
		personalModel,
		questionsModel,
		livestreamModel,
		permissionsModel,
		administrativeModel,
	}
}
