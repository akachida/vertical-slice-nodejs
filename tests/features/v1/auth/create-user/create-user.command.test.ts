import { CreateUserCommand } from '@/features/v1/auth/create-user/create-user.command'
import { ZodError } from 'zod'

describe('CreateUserCommand', () => {
  describe('fromInput', () => {
    it('should create a command for valid input', () => {
      const input = { email: 'test@test.com', name: 'Test User' }
      const command = CreateUserCommand.fromInput(input)
      expect(command).toBeInstanceOf(CreateUserCommand)
      expect(command.email).toBe('test@test.com')
      expect(command.name).toBe('Test User')
    })

    it('should throw a ZodError for an invalid email', () => {
      const input = { email: 'not-an-email', name: 'Test User' }
      expect(() => CreateUserCommand.fromInput(input)).toThrow(ZodError)
    })

    it('should throw a ZodError for a name that is too short', () => {
      const input = { email: 'test@test.com', name: '' }
      expect(() => CreateUserCommand.fromInput(input)).toThrow(ZodError)
    })

    it('should throw a ZodError for a name that is too long', () => {
      const longName = 'a'.repeat(101)
      const input = { email: 'test@test.com', name: longName }
      expect(() => CreateUserCommand.fromInput(input)).toThrow(ZodError)
    })

    it('should successfully create a command with boundary name lengths', () => {
      const inputMin = { email: 'test@test.com', name: 'a' }
      expect(() => CreateUserCommand.fromInput(inputMin)).not.toThrow()

      const longName = 'a'.repeat(100)
      const inputMax = { email: 'test@test.com', name: longName }
      expect(() => CreateUserCommand.fromInput(inputMax)).not.toThrow()
    })
  })
})
