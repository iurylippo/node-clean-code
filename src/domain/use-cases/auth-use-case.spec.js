import { MissingParamError } from '../../utils/errors/missing-param-error'
import { AuthUseCase } from './auth-use-case'
import { randomUUID } from 'crypto'

const makeEncrypter = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      return true
    }
  }

  const encrypterSpy = new EncrypterSpy()
  return encrypterSpy
}

const accessToken = randomUUID()
const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    async generate (userId) {
      return accessToken
    }
  }

  const tokenGeneratorSpy = new TokenGeneratorSpy()

  return tokenGeneratorSpy
}

const userId = randomUUID()
const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    user = { id: userId, email: 'valid_email@email', password: 'hashed_pass' }
    async load (email) {
      return this.user
    }
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  return loadUserByEmailRepositorySpy
}

const makeSut = () => {
  const encrypterSpy = makeEncrypter()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const tokenGeneratorSpy = makeTokenGenerator()

  const sut = new AuthUseCase(loadUserByEmailRepositorySpy, encrypterSpy, tokenGeneratorSpy)

  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy,
    tokenGeneratorSpy
  }
}

describe('Auth UseCase', () => {
  it('Should throw if no email is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth()

    expect(promise).rejects.toThrowError(new MissingParamError('email'))
  })

  it('Should throw if no password is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth('any_email@email')

    expect(promise).rejects.toThrowError(new MissingParamError('password'))
  })

  it('Should call loadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    jest.spyOn(loadUserByEmailRepositorySpy, 'load').mockImplementation(jest.fn(async () => null))

    const email = 'any_email@email'
    await sut.auth(email, 'pass')

    expect(loadUserByEmailRepositorySpy.load).toBeCalledWith(email)
  })

  it('Should throw if no email is provided in loadUserByEmailRepository auth', async () => {
    const sut = new AuthUseCase()

    const email = 'any_email@email'
    const promise = sut.auth(email, 'pass')

    expect(promise).rejects.toThrow()
  })

  it('Should throw if no load function exists in loadUserByEmailRepository auth', async () => {
    const sut = new AuthUseCase({})

    const email = 'any_email@email'
    const promise = sut.auth(email, 'pass')

    expect(promise).rejects.toThrow()
  })

  it('Should return null if an invalid email is provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    jest.spyOn(loadUserByEmailRepositorySpy, 'load').mockImplementation(jest.fn(async () => null))

    const email = 'invalid_email@email'
    const accessToken = await sut.auth(email, 'pass')
    expect(accessToken).toBeNull()
  })

  it('Should return null if an invalid password is provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    jest.spyOn(loadUserByEmailRepositorySpy, 'load').mockImplementation(jest.fn(async () => null))
    const email = 'valid_email@email'
    const accessToken = await sut.auth(email, 'pass')
    expect(accessToken).toBeNull()
  })

  it('Should call Encrypter with correct values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut()

    jest.spyOn(encrypterSpy, 'compare').mockImplementation(jest.fn())

    const email = 'valid_email@email'
    const pass = 'pass'
    const hashedPass = loadUserByEmailRepositorySpy.user.password
    await sut.auth(email, pass)
    expect(encrypterSpy.compare).toBeCalledWith(pass, hashedPass)
  })

  it('Should call TokenGenerator with user id', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()

    const email = 'valid_email@email'
    const pass = 'valid_pass'
    jest.spyOn(tokenGeneratorSpy, 'generate').mockImplementation(jest.fn(async () => null))

    await sut.auth(email, pass)

    expect(tokenGeneratorSpy.generate).toBeCalledWith(loadUserByEmailRepositorySpy.user.id)
  })

  it('Should return an accessToken if credentials is valid', async () => {
    const { sut } = makeSut()

    const email = 'valid_email@email'
    const pass = 'valid_pass'

    const accessToken = await sut.auth(email, pass)

    expect(accessToken).toBe(accessToken)
    expect(accessToken).toBeTruthy()
  })
})
