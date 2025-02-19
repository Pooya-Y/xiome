
import {html} from "../../../../../framework/component/component.js"

export function renderIdentifier({id, label}: {
		id: string
		label: string
	}) {
	return html`
		<span class=identifier title="${id}">
			<span class=identifier-label>${label}</span>
			<span class=identifier-id>${id}</span>
		</span>
	`
}
