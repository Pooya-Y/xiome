
import {generateRemote} from "renraku/x/remote/generate-remote.js"
import {makeJsonRequester} from "renraku/x/remote/make-json-requester.js"

import {prepareApiShape} from "./auth/prepare-api-shape.js"
import {FlexStorage} from "../../toolbox/flex-storage/types/flex-storage.js"

export function makeRemote({
		id_app,
		apiLink,
		storage,
	}: {
		id_app: string
		apiLink: string
		storage: FlexStorage
	}) {

	const {shape, installAuthMediator} = prepareApiShape({
		id_app,
		storage,
	})

	const remote = generateRemote({
		link: apiLink,
		shape: shape,
		requester: makeJsonRequester({
			fetch: window.fetch,
			headers: {},
		}),
	})

	const authMediator = installAuthMediator({
		greenService: remote.auth.greenService,
	})

	return {remote, authMediator}
}
