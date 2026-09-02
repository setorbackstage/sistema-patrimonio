import { getSession } from "./session"

export async function auth() {
  return await getSession()
}

export const handlers = {}
