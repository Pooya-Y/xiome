
import {XiomeExample} from "./xiome-example/xiome-example.js"
import {mixinMadstateSubscriptions, mixinShare} from "../../../framework/component/component.js"
import {XiomeComponentOptions} from "../../../assembly/frontend/components/types/xiome-component-options.js"

export function integrateExampleComponents({models, modals}: XiomeComponentOptions) {
	const {exampleModel} = models
	return {
		XiomeExample: (
			mixinMadstateSubscriptions(exampleModel.subscribe)(
				mixinShare({
					modals,
					exampleModel,
				})(XiomeExample)
			)
		),
	}
}
