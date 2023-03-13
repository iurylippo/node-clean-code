import { MissingParamError } from '../helpers/missing-param-error'
import { ServerError } from '../helpers/server-error'
import { UnauthorizedError } from '../helpers/unauthorized-error'
import { LoginRouter } from './login-router'

const makeSut = () => {
  const authUseCaseSpy = makeAuthUserCase()
  authUseCaseSpy.accessToken = 'valid_token'
  const sut = new LoginRouter(authUseCaseSpy)

  return {
    authUseCaseSpy,
    sut
  }
}

const makeAuthUserCase = () => {
  class AuthUseCaseSpy {
    auth = jest.fn(() => {
      return this.accessToken
    })
  }

  return new AuthUseCaseSpy()
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    auth () {
      throw new Error()
    }
  }

  return new AuthUseCaseSpy()
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
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('Should return 500 if no httpRequest body is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {}
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
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
    expect(httpResponse.body).toEqual(new ServerError())
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
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('Should return 500 when authUseCase has not auth method', () => {
    const authUseCaseSpy = makeAuthUseCaseWithError()
    const sut = new LoginRouter(authUseCaseSpy)

    const httpRequest = {
      body: {
        email: 'test@email.com',
        password: 'pass'
      }

    }
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('Should return 200 when valid credentials is provided', () => {
    const { sut, authUseCaseSpy } = makeSut()

    const httpRequest = {
      body: {
        email: 'valid_test@email.com',
        password: 'valid_pass'
      }

    }
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
  })
})
