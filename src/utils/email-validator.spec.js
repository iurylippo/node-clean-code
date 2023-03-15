import validator from 'validator'

class EmailValidator {
  isValid (email) {
    return validator.isEmail(email)
  }
}

describe('Email Validator', () => {
  const emailValidatorMock = jest.spyOn(validator, 'isEmail')

  it('Should return true if validator returns true', () => {
    const sut = new EmailValidator()

    emailValidatorMock.mockImplementation(() => true)

    const isEmailValid = sut.isValid('valid_email@email.com')

    expect(isEmailValid).toBe(true)
  })

  it('Should return true if validator returns true', () => {
    const sut = new EmailValidator()
    emailValidatorMock.mockImplementation(() => false)

    const isEmailValid = sut.isValid('email_not_valid')

    expect(isEmailValid).toBe(false)
  })
})
