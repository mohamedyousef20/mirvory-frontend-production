/** /api/users/me answers { success, data: <user> }. Older code read data.data.user, which is always undefined, so profile fields came back empty. */
export function unwrapUser(res: any) {
  const body = res?.data
  return body?.data?.user ?? body?.data ?? body?.user ?? body ?? null
}
