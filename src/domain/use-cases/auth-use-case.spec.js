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

const makeUpdateAccessTokenRepository = () => {
  class UpdateAccessTokenRepositorySpy {
    async execute (userId, AccessToken) {
      return true
    }
  }

  const updateAccessTokenRepositorySpy = new UpdateAccessTokenRepositorySpy()
  return updateAccessTokenRepositorySpy
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
  const updateAccessTokenRepositorySpy = makeUpdateAccessTokenRepository()

  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encrypterSpy,
    tokenGenerator: tokenGeneratorSpy,
    updateAccessTokenRepository: updateAccessTokenRepositorySpy
  }
  )

  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy,
    tokenGeneratorSpy,
    updateAccessTokenRepositorySpy
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

  it('Should throw if no dependency provided in AuthUserCase', async () => {
    const sut = new AuthUseCase()

    const email = 'any_email@email'
    const promise = sut.auth(email, 'pass')

    expect(promise).rejects.toThrow()
  })

  it('Should throw if no email is provided in loadUserByEmailRepository auth', async () => {
    const sut = new AuthUseCase({})

    const email = 'any_email@email'
    const promise = sut.auth(email, 'pass')

    expect(promise).rejects.toThrow()
  })

  it('Should throw if no load function exists in loadUserByEmailRepository auth', async () => {
    const sut = new AuthUseCase({ loadUserByEmailRepository: {} })

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

  it('Should call UpdateAccessTokenRepository with correct values', async () => {
    const { sut, updateAccessTokenRepositorySpy } = makeSut()

    const email = 'valid_email@email'
    const pass = 'valid_pass'

    jest.spyOn(updateAccessTokenRepositorySpy, 'execute').mockImplementation(jest.fn())

    await sut.auth(email, pass)

    expect(updateAccessTokenRepositorySpy.execute).toBeCalledWith(userId, accessToken)
  })

  it('Should return an accessToken if credentials is valid', async () => {
    const { sut } = makeSut()

    const email = 'valid_email@email'
    const pass = 'valid_pass'

    const accessToken = await sut.auth(email, pass)

    expect(accessToken).toBe(accessToken)
    expect(accessToken).toBeTruthy()
  })

  it('Should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypter = makeEncrypter()
    const tokenGenerator = makeTokenGenerator()

    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({}),
      new AuthUseCase({ loadUserByEmailRepository: invalid }),
      new AuthUseCase({
        loadUserByEmailRepository
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository: invalid
      })
    )

    const email = 'any_email@email'

    for (const sut of suts) {
      const promise = sut.auth(email, 'pass')

      expect(promise).rejects.toThrow()
    }
  })

  it('Should throw if any dependencies throws', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypter = makeEncrypter()
    const tokenGenerator = makeTokenGenerator()
    const updateAccessTokenRepository = makeUpdateAccessTokenRepository()

    const loadUserByEmailRepositoryError = new Error('loadUserByEmailRepository error')
    const loadUserByEmailRepositoryMock = jest.spyOn(loadUserByEmailRepository, 'load')
    loadUserByEmailRepositoryMock.mockImplementation(jest.fn(async () => {
      throw loadUserByEmailRepositoryError
    }))

    const encrypterError = new Error('encrypter error')
    const encrypterMock = jest.spyOn(encrypter, 'compare')
    encrypterMock.mockImplementation(jest.fn(async () => {
      throw encrypterError
    }))

    const tokenGeneratorError = new Error('tokenGenerator error')
    const tokenGeneratorMock = jest.spyOn(tokenGenerator, 'generate')
    tokenGeneratorMock.mockImplementation(jest.fn(async () => {
      throw tokenGeneratorError
    }))

    const updateAccessTokenRepositoryError = new Error('updateAccessTokenRepository error')
    const updateAccessTokenRepositoryMock = jest.spyOn(updateAccessTokenRepository, 'execute')
    updateAccessTokenRepositoryMock.mockImplementation(jest.fn(async () => {
      throw updateAccessTokenRepositoryError
    }))

    const suts = [
      {
        sut: new AuthUseCase({ loadUserByEmailRepository }),
        mockToRestore: loadUserByEmailRepositoryMock,
        error: loadUserByEmailRepositoryError
      },
      {
        sut: new AuthUseCase({ loadUserByEmailRepository, encrypter }),
        mockToRestore: encrypterMock,
        error: encrypterError
      },
      {
        sut: new AuthUseCase({ loadUserByEmailRepository, encrypter, tokenGenerator }),
        mockToRestore: tokenGeneratorMock,
        error: tokenGeneratorError
      },
      {
        sut: new AuthUseCase({ loadUserByEmailRepository, encrypter, tokenGenerator, updateAccessTokenRepository }),
        mockToRestore: updateAccessTokenRepositoryMock,
        error: updateAccessTokenRepositoryError
      }
    ]

    const email = 'any_email@email'

    for (const sutObject of suts) {
      const { sut, mockToRestore, error } = sutObject

      const promise = sut.auth(email, 'pass')
      await expect(promise).rejects.toThrowError(error)

      if (mockToRestore) {
        await mockToRestore.mockRestore()
      }
    }
  })
})
