
import {namespaceKeyAppId} from "./namespace-key-app-id.js"
import {DbbyRow, DbbyTable} from "../../../toolbox/dbby/dbby-types.js"
import {prepareConstrainTables} from "../../../toolbox/dbby/dbby-constrain.js"

export function prepareTableNamespacer<
			xTables extends {[key: string]: DbbyTable<DbbyRow>}
		>(tables: xTables) {

	return function namespaceAppTables(appId: string) {
		return prepareConstrainTables(tables)({[namespaceKeyAppId]: appId})
	}
}
