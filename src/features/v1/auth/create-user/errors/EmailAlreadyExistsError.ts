import { ErrorResult } from '@/shared/result'

export class EmailAlreadyExistsError extends ErrorResult {
  private constructor() {
    super('Email already exists', [])
  }

  static default() {
    return new EmailAlreadyExistsError()
  }
}
