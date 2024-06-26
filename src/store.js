import { writable } from 'svelte/store'
import { browser } from '$app/env'

let persistedUser = browser && localStorage.getItem('user')
export let user = writable(persistedUser ? JSON.parse(persistedUser) : '')

if (browser) {
    user.subscribe(u => localStorage.user = u)
}