import { MissingParamError } from '../../utils/errors/missing-param-error'

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

    await this.loadUserByEmailRepository.load(email)
  }
}

describe('Auth UseCase', () => {
  it('Should throw if no email is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth()

    expect(promise).rejects.toThrowError(new MissingParamError('email'))
  })

  it('Should throw if no password is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth('any_email@email')

    expect(promise).rejects.toThrowError(new MissingParamError('password'))
  })

  it('Should call loadUserByEmailRepository with correct email', async () => {
    class LoadUserByEmailRepositorySpy {
      load = jest.fn(async () => null)
    }

    const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()

    const sut = new AuthUseCase(loadUserByEmailRepositorySpy)
    const email = 'any_email@email'
    await sut.auth(email, 'pass')

    expect(loadUserByEmailRepositorySpy.load).toBeCalledWith(email)
  })
})