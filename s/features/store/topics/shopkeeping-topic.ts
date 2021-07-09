
import {ApiError} from "renraku/x/api/api-error.js"
import {asTopic} from "renraku/x/identities/as-topic.js"

import {find} from "../../../toolbox/dbby/dbby-helpers.js"
import {apiProblems} from "../../../toolbox/api-validate.js"
import {RoleRow} from "../../auth/tables/types/rows/role-row.js"
import {ClerkAuth} from "../api/policies/types/contexts/clerk-auth.js"
import {subscriptionPlanFromRow} from "./utils/subscription-plan-from-row.js"
import {SubscriptionPlanRow} from "../api/tables/types/rows/subscription-plan-row.js"
import {validateSubscriptionPlanDraft} from "./utils/validate-subscription-plan-draft.js"
import {SubscriptionPlanDraft} from "../api/tables/types/drafts/subscription-plan-draft.js"

const hardcodedCurrency = "usd"
const hardcodedInterval = "month"

export const shopkeepingTopic = ({generateId}: {
		generateId: () => string
	}) => asTopic<ClerkAuth>()({

	async listSubscriptionPlans({tables}) {
		const rows = await tables.billing.subscriptionPlans
			.read({conditions: false})

		const roleFinders = rows
			.map(row => row.id_role)
			.map(id_role => ({id_role}))

		const roles = await tables.permissions.role.read(find(...roleFinders))

		const plans = rows.map(plan => subscriptionPlanFromRow({
			plan,
			role: roles.find(role => role.id_role === plan.id_role),
		}))

		return plans
	},

	async createSubscriptionPlan(
			{tables, stripeLiaisonForApp},
			{draft}: {draft: SubscriptionPlanDraft}
		) {

		apiProblems(validateSubscriptionPlanDraft(draft))

		const stripeProduct = await stripeLiaisonForApp.products.create({
			name: draft.label,
		})

		const stripePrice = await stripeLiaisonForApp.prices.create({
			unit_amount: draft.price,
			currency: hardcodedCurrency,
			recurring: {interval: hardcodedInterval},
		})

		const role: RoleRow = {
			hard: true,
			public: true,
			label: draft.label,
			id_role: generateId(),
			assignable: true,
		}

		const plan: SubscriptionPlanRow = {
			active: true,
			price: draft.price,
			id_role: role.id_role,
			stripePriceId: stripePrice.id,
			stripeProductId: stripeProduct.id,
			id_subscriptionPlan: generateId(),
		}

		await Promise.all([
			tables.permissions.role.create(role),
			tables.billing.subscriptionPlans.create(plan),
		])

		return subscriptionPlanFromRow({role, plan})
	},

	async updateSubscriptionPlan(
		{tables, stripeLiaisonForApp},
		{id_subscriptionPlan, draft}: {
			id_subscriptionPlan: string
			draft: SubscriptionPlanDraft
		}) {

		apiProblems(validateSubscriptionPlanDraft(draft))

		const stripeNewPrice = await stripeLiaisonForApp.prices.create({
			unit_amount: draft.price,
			currency: hardcodedCurrency,
			recurring: {interval: hardcodedInterval},
		})

		await tables.billing.subscriptionPlans.update({
			...find({id_subscriptionPlan}),
			write: {
				stripePriceId: stripeNewPrice.id,
				price: stripeNewPrice.unit_amount,
			},
		})

		const plan = await tables.billing.subscriptionPlans
			.one(find({id_subscriptionPlan}))

		await tables.permissions.role.update({
			...find({id_role: plan.id_role}),
			write: {label: draft.label},
		})

		const role = await tables.permissions.role
			.one(find({id_role: plan.id_role}))

		return subscriptionPlanFromRow({role, plan})
	},

	async deactivateSubscriptionPlan(
			{tables, stripeLiaisonForApp},
			{id_subscriptionPlan}: {id_subscriptionPlan: string},
		) {

		const {stripePriceId} = await tables.billing.subscriptionPlans
			.one(find({id_subscriptionPlan}))

		await stripeLiaisonForApp.prices
			.update(stripePriceId, {active: false})

		// TODO cancel all stripe subscriptions

		await tables.billing.subscriptionPlans.update({
			...find({id_subscriptionPlan}),
			write: {active: false},
		})
	},

	async deleteSubscriptionPlan(
			{tables},
			{id_subscriptionPlan}: {id_subscriptionPlan: string}
		) {

		const {id_role, active} = await tables.billing.subscriptionPlans
			.one(find({id_subscriptionPlan}))

		if (active)
			throw new ApiError(400, `deleting active subscriptions is forbidden`)

		await Promise.all([
			tables.permissions.role.delete(find({id_role})),
			tables.billing.subscriptionPlans.delete(find({id_subscriptionPlan})),
		])
	},
})
