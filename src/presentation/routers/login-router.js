import { HttpResponse } from '../helpers/http-response'

export class LoginRouter {
  constructor (authUserCase) {
    this.authUserCase = authUserCase
  }

  async route (httpRequest) {
    try {
      const { email, password } = httpRequest.body

      if (!email) {
        return HttpResponse.badRequest('email')
      }

      if (!password) {
        return HttpResponse.badRequest('password')
      }

      const accessToken = await this.authUserCase.auth(email, password)

      if (!accessToken) {
        return HttpResponse.unauthorizedError('password')
      }

      return HttpResponse.ok({ accessToken })
    } catch (error) {
      // console.log(error)
      return HttpResponse.serverError()
    }
  }
}
