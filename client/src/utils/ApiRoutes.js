

export const HOST = 'http://localhost:3005'

const AUTH_ROUTE = `${HOST}/api/auth`
const MESSAGES_ROUTE = `${HOST}/api/messages`

//auth
export const CHECK_USER_ROUTE = `${AUTH_ROUTE}/check-user`
export const OnBOARD_USER_ROUTE = `${AUTH_ROUTE}/onboard-user`
export const GET_ALL_CONTACTS_ROUTE = `${AUTH_ROUTE}/get-contacts`

//messages
export const ADD_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-message` 
export const GET_MESSAGES_ROUTE = `${MESSAGES_ROUTE}/get-messages` 