import { allFillial, findClient, findIdVakansiya, findVakansiya } from "../sql/index.js"
import { a } from "../utils/pg.js"

export const fKeyboard = (arr, icon = "") => {
    const a = []
    for (let i = 0; i < arr?.length; i + 2) {
        a.push([`${arr[i]?.shahar} ${icon}`, arr[++i] ? `${arr[i]?.shahar} ${icon}` : ''].filter(e => e))
        i++
    }
    return a
}

export const vKeyboard = (arr, icon = "") => {
    const a = []
    for (let i = 0; i < arr?.length; i + 2) {
        a.push([`${arr[i]?.vakansiya} ${icon}`, arr[++i] ? `${arr[i]?.vakansiya} ${icon}` : ''].filter(e => e))
        i++
    }
    return a
}

export const ifFillial = async (text) => {
    const fillials = await a(allFillial)
    return fillials.find(e => e.shahar == text)
}

export const vakansiyaRender = async (text) => {
    const fillials = await a(allFillial)
    const b = fillials.find(e => e.shahar == text)
    if (b) {
        const mineVakansiya = await a(findVakansiya, b?.shahar)
        const data = []
        for (let i = 0; i < mineVakansiya?.length; i + 2) {
            data.push([mineVakansiya[i]?.vakansiya, mineVakansiya[++i]?.vakansiya].filter(e => e))
            i++
        }
        return data
    } else {
        return []
    }
}

export const findVakansiyaFn = async (chatId, text) => {
    const findUser = await a(findClient, chatId)
    const fillialId = findUser[0]?.fillial
    if (fillialId) {
        const findVakansiya = await a(findIdVakansiya, fillialId)
        if (findVakansiya.find(e => e?.vakansiya == text)) {
            return findVakansiya.find(e => e?.vakansiya == text)?.id
        } else {
            return false
        }
    } else {
        return false
    }
}