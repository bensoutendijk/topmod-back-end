export type LocalUserPermission = 'admin' | 'tester' | 'default'
export type LocalUserService = 'mixer' | 'twitch' | 'instagram' | 'facebook' | 'twitter'

export interface ILocalUser {
  _id: any
  email: string,
  permissions: Array<LocalUserPermission>,
  services: Array<LocalUserService>,
}