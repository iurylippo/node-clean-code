import { MissingParamError } from '../../utils/errors/missing-param-error'
import { AuthUseCase } from './auth-use-case'

const makeSut = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      return null
    }
  }

  class LoadUserByEmailRepositorySpy {
    user = { email: 'valid_email@email', password: 'hashed_pass' }
    async load (email) {
      return this.user
    }
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  const encrypterSpy = new EncrypterSpy()

  const sut = new AuthUseCase(loadUserByEmailRepositorySpy, encrypterSpy)

  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy
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
})
