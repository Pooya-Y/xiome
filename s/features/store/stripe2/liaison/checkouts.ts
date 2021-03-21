
import {Stripe} from "stripe"
import {LiaisonOptions} from "../types/liaison-options.js"
import {SetupSubscriptionMetadata} from "./types/setup-subscription-metadata.js"
import {SetupDefaultPaymentsMetadata} from "./types/setup-default-payments-metadata.js"

export function stripeLiaisonCheckouts({stripe, returningLinks}: LiaisonOptions) {

	async function checkoutSession({userId, stripeCustomerId, ...params}: {
			userId: string
			stripeCustomerId: string
		} & {mode: Stripe.Checkout.SessionCreateParams["mode"]}
			& Partial<Stripe.Checkout.SessionCreateParams>
		) {
		const session = await stripe.checkout.sessions.create({
			customer: stripeCustomerId,
			client_reference_id: userId,
			payment_method_types: ["card"],
			cancel_url: returningLinks.checkouts.cancel,
			success_url: returningLinks.checkouts.success,
			...params,
		})
		return {stripeSessionId: session.id}
	}

	return {

		async purchaseSubscription({
				userId, stripePriceIds, stripeCustomerId,
			}: {
				userId: string
				stripePriceIds: string[]
				stripeCustomerId: string
			}) {
			return checkoutSession({
				userId,
				stripeCustomerId,
				mode: "subscription",
				line_items: stripePriceIds.map(id => ({
					price: id,
					quantity: 1,
				})),
			})
		},

		async setupSubscription({
				userId, stripeCustomerId, stripeSubscriptionId,
			}: {
				userId: string
				stripeCustomerId: string
				stripeSubscriptionId: string
			}) {
			return checkoutSession({
				userId,
				stripeCustomerId,
				mode: "setup",
				setup_intent_data: {
					metadata: <SetupSubscriptionMetadata>{
						flow: "update-subscription",
						customer_id: stripeCustomerId,
						subscription_id: stripeSubscriptionId,
					},
				},
			})
		},

		async setupDefaultPayments({
				userId, stripeCustomerId,
			}: {
				userId: string
				stripeCustomerId: string
			}) {
			return checkoutSession({
				userId,
				stripeCustomerId,
				mode: "setup",
				setup_intent_data: {
					metadata: <SetupDefaultPaymentsMetadata>{
						flow: "update-default-payments",
						customer_id: stripeCustomerId,
					},
				},
			})
		},
	}
}
