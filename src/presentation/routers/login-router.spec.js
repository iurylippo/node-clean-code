import { MissingParamError } from '../helpers/missing-param-error'
import { UnauthorizedError } from '../helpers/unauthorized-error'
import { LoginRouter } from './login-router'

const makeSut = () => {
  class AuthUseCaseSpy {
    auth = jest.fn(() => {
      return this.accessToken
    })
  }

  const authUseCaseSpy = new AuthUseCaseSpy()
  const sut = new LoginRouter(authUseCaseSpy)
  authUseCaseSpy.accessToken = 'valid_token'

  return {
    authUseCaseSpy,
    sut
  }
}

describe('Login Router', () => {
  it('Should return 400 if no email is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'pass'
      }
    }
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  it('Should return 400 if no password is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'pass'
      }
    }
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
  })

  it('Should return 500 if no httpRequest is provided', () => {
    const { sut } = makeSut()

    const httpResponse = sut.route()

    expect(httpResponse.statusCode).toBe(500)
  })

  it('Should return 500 if no httpRequest body is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {}
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })

  it('Should call AuthUseCase with correct params', () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'test@email.com',
        password: 'pass'
      }

    }
    sut.route(httpRequest)

    expect(authUseCaseSpy.auth).toBeCalledWith(httpRequest.body.email, httpRequest.body.password)
  })

  it('Should return 401 when invalide credentials is provided', () => {
    const { sut, authUseCaseSpy } = makeSut()
    authUseCaseSpy.accessToken = null
    const httpRequest = {
      body: {
        email: 'invalid_test@email.com',
        password: 'invalid_pass'
      }

    }
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  it('Should return 500 when authUseCase is not provided', () => {
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        email: 'test@email.com',
        password: 'pass'
      }

    }
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })

  it('Should return 500 when authUseCase has not auth method', () => {
    const sut = new LoginRouter({})

    const httpRequest = {
      body: {
        email: 'test@email.com',
        password: 'pass'
      }

    }
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })

  it('Should return 200 when valid credentials is provided', () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        email: 'valid_test@email.com',
        password: 'valid_pass'
      }

    }
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(200)
  })
})
