import validator from 'validator'
import { EmailValidator } from './email-validator'

const makeSut = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
  const emailValidatorMock = jest.spyOn(validator, 'isEmail')

  it('Should return true if validator returns true', () => {
    const sut = makeSut()

    emailValidatorMock.mockImplementation(() => true)

    const isEmailValid = sut.isValid('valid_email@email.com')

    expect(isEmailValid).toBe(true)
  })

  it('Should return false if validator returns false', () => {
    const sut = makeSut()
    emailValidatorMock.mockImplementation(() => false)

    const isEmailValid = sut.isValid('email_not_valid')

    expect(isEmailValid).toBe(false)
  })

  it('Should call with correct email', () => {
    const sut = makeSut()
    emailValidatorMock.mockImplementation(() => true)
    sut.isValid('email_valid@email')

    expect(emailValidatorMock).toBeCalledWith('email_valid@email')
  })
})
