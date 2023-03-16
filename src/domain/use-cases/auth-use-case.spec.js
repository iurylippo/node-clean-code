import { MissingParamError } from '../../utils/errors/missing-param-error'
import { InvalidParamError } from '../../utils/errors/invalid-param-error'

class AuthUseCase {
  constructor (loadUserByEmailRepository) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
  }

  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }

    if (!password) {
      throw new MissingParamError('password')
    }

    if (!this.loadUserByEmailRepository) {
      throw new MissingParamError('loadUserByEmailRepository')
    }

    if (!this.loadUserByEmailRepository.load) {
      throw new InvalidParamError('loadUserByEmailRepository')
    }

    const user = await this.loadUserByEmailRepository.load(email)

    if (!user) {
      return null
    }
  }
}

const makeSut = () => {
  class LoadUserByEmailRepositorySpy {
    load = jest.fn(async () => null)
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()

  const sut = new AuthUseCase(loadUserByEmailRepositorySpy)

  return {
    sut,
    loadUserByEmailRepositorySpy
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
    const email = 'any_email@email'
    await sut.auth(email, 'pass')

    expect(loadUserByEmailRepositorySpy.load).toBeCalledWith(email)
  })

  it('Should throw if no email is provided in loadUserByEmailRepository auth', async () => {
    const sut = new AuthUseCase()

    const email = 'any_email@email'
    const promise = sut.auth(email, 'pass')

    expect(promise).rejects.toThrowError(new MissingParamError('loadUserByEmailRepository'))
  })

  it('Should throw if no load function exists in loadUserByEmailRepository auth', async () => {
    const sut = new AuthUseCase({})

    const email = 'any_email@email'
    const promise = sut.auth(email, 'pass')

    expect(promise).rejects.toThrowError(new InvalidParamError('loadUserByEmailRepository'))
  })

  it('Should return null if loadUserByEmailRepository returns null', async () => {
    const { sut } = makeSut()

    const email = 'invalid_email@email'
    const accessToken = await sut.auth(email, 'pass')
    expect(accessToken).toBeNull()
  })
})
