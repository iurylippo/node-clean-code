import { MissingParamError } from '../helpers/missing-param-error'
import { LoginRouter } from './login-router'

const makeSut = () => {
  return new LoginRouter()
}

describe('Login Router', () => {
  it('Should return 400 if no email is provided', () => {
    const sut = makeSut()
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
    const sut = makeSut()
    const httpRequest = {
      body: {
        email: 'pass'
      }
    }
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
  })

  it('Should return 500 if no httpRequest is provided', () => {
    const sut = makeSut()

    const httpResponse = sut.route()

    expect(httpResponse.statusCode).toBe(500)
  })

  it('Should return 500 if no httpRequest body is provided', () => {
    const sut = makeSut()
    const httpRequest = {}
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })

  it('Should call AuthUseCase with correct params', () => {
    const sut = makeSut()
    const httpRequest = {}
    const httpResponse = sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })
})
