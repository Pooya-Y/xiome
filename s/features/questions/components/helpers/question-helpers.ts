
import {User} from "../../../auth/types/user.js"
import {Question} from "../../api/types/question.js"

// export function ascertainOwnership(question: Question, me: User) {
// 	if (!me) return {mine: false, authority: false}
// 	const admin = (me && me.claims.admin)
// 	const mine = me && (me.id_user === question.authorUserId)
// 	return {
// 		mine,
// 		authority: admin || mine,
// 	}
// }

// const sortLikes = (a: Question, b: Question) => a.likes > b.likes
// 	? -1
// 	: 1

// export const sortQuestions = (me: MetalUser, questions: Question[]) => {
// 	const myUserId = me?.id_user
// 	const filterMine = (q: Question) => q.author.id_user === myUserId
// 	const filterTheirs = (q: Question) => q.author.id_user !== myUserId
// 	return myUserId
// 		? [
// 			...questions.filter(filterMine).sort(sortLikes),
// 			...questions.filter(filterTheirs).sort(sortLikes),
// 		]
// 		: [...questions].sort(sortLikes)
// }
