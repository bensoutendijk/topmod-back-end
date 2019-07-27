export interface IOAuthUser {
  localUser: string,
  tokens: {
    accessToken: string
    refreshToken: string
    expiresAt: Date
  }
  provider: string,
}