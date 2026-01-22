import { Result, Unit } from '@/shared/result'

describe('Result', () => {
  describe('Constructors', () => {
    it('Result.ok should create an Ok result', () => {
      const ok = Result.ok(42)
      expect(ok.isOk()).toBe(true)
      expect(ok.isErr()).toBe(false)
      expect(ok.unwrap()).toBe(42)
    })

    it('Result.err should create an Err result', () => {
      const err = Result.err('Error')
      expect(err.isOk()).toBe(false)
      expect(err.isErr()).toBe(true)
      expect(err.unwrapErr()).toBe('Error')
    })

    it('Result.unit should create an Ok result with no value', () => {
      const unit = Result.unit()
      expect(unit.isOk()).toBe(true)
      expect(unit.isErr()).toBe(false)
      expect(unit.unwrap()).toBe(undefined)
    })
  })

  describe('isOk/isErr', () => {
    it('isOk should be true for Ok and false for Err', () => {
      expect(Result.ok(1).isOk()).toBe(true)
      expect(Result.err('error').isOk()).toBe(false)
    })

    it('isErr should be false for Ok and true for Err', () => {
      expect(Result.ok(1).isErr()).toBe(false)
      expect(Result.err('error').isErr()).toBe(true)
    })
  })

  describe('isOkAnd/isErrAnd', () => {
    it('isOkAnd should be true only if Ok and predicate is true', () => {
      expect(Result.ok(2).isOkAnd((v) => v > 1)).toBe(true)
      expect(Result.ok(0).isOkAnd((v) => v > 1)).toBe(false)
      expect(Result.err('error').isOkAnd((v) => v > 1)).toBe(false)
    })

    it('isErrAnd should be true only if Err and predicate is true', () => {
      expect(Result.err('error').isErrAnd((e) => e.length > 1)).toBe(true)
      expect(Result.err('e').isErrAnd((e) => e.length > 1)).toBe(false)
      expect(Result.ok(123).isErrAnd((e) => e > 1)).toBe(false)
    })
  })

  describe('unwrap methods', () => {
    it('unwrap should return value for Ok and throw for Err', () => {
      expect(Result.ok(42).unwrap()).toBe(42)
      expect(() => Result.err('error').unwrap()).toThrow('Called unwrap on an Err value: "error"')
    })

    it('unwrapOr should return value for Ok and default for Err', () => {
      expect(Result.ok(42).unwrapOr(0)).toBe(42)
      expect(Result.err<string, number>('error').unwrapOr(0)).toBe(0)
    })

    it('unwrapOrElse should return value for Ok and computed value for Err', () => {
      expect(Result.ok(42).unwrapOrElse(() => 0)).toBe(42)
      expect(Result.err<string, number>('error').unwrapOrElse((e) => e.length)).toBe(5)
    })

    it('unwrapErr should return error for Err and throw for Ok', () => {
      expect(Result.err('error').unwrapErr()).toBe('error')
      expect(() => Result.ok(42).unwrapErr()).toThrow('Called unwrapErr on an Ok value: 42')
    })
  })

  describe('ok/err conversion', () => {
    it('ok should return value for Ok and undefined for Err', () => {
      expect(Result.ok(42).ok()).toBe(42)
      expect(Result.err('error').ok()).toBeUndefined()
    })

    it('err should return undefined for Ok and error for Err', () => {
      expect(Result.ok(42).err()).toBeUndefined()
      expect(Result.err('error').err()).toBe('error')
    })
  })

  describe('match', () => {
    it('should call the ok handler for an Ok result', () => {
      const ok = Result.ok(42)
      const handlers = {
        ok: jest.fn((v) => `Success: ${v}`),
        err: jest.fn((e) => `Failure: ${e}`),
      }
      const result = ok.match(handlers)

      expect(handlers.ok).toHaveBeenCalledWith(42)
      expect(handlers.err).not.toHaveBeenCalled()
      expect(result).toBe('Success: 42')
    })

    it('should call the err handler for an Err result', () => {
      const err = Result.err('Explosion')
      const handlers = {
        ok: jest.fn((v) => `Success: ${v}`),
        err: jest.fn((e) => `Failure: ${e}`),
      }
      const result = err.match(handlers)

      expect(handlers.ok).not.toHaveBeenCalled()
      expect(handlers.err).toHaveBeenCalledWith('Explosion')
      expect(result).toBe('Failure: Explosion')
    })
  })

  describe('map/flatMap/mapErr', () => {
    it('map should transform Ok value and leave Err unchanged', () => {
      const ok = Result.ok(5).map((v) => v * 2)
      expect(ok.unwrap()).toBe(10)

      const err = Result.err<string, number>('error').map((v) => v * 2)
      expect(err.unwrapErr()).toBe('error')
    })

    it('flatMap should transform Ok value into a new Result and leave Err unchanged', () => {
      const ok = Result.ok<number, string>(5).flatMap((v) => Result.ok(v.toString()))
      expect(ok.unwrap()).toBe('5')

      const errFlat = Result.ok<number, string>(5).flatMap((v) => Result.err<string, number>('transformed error'))
      expect(errFlat.unwrapErr()).toBe('transformed error')

      const err = Result.err<string, string>('original error').flatMap((v) => Result.ok<string, string>(v.toString()))
      expect(err.unwrapErr()).toBe('original error')
    })

    it('mapErr should transform Err value and leave Ok unchanged', () => {
      const err = Result.err<string, number>('original error').mapErr((e) => e.toUpperCase())
      expect(err.unwrapErr()).toBe('ORIGINAL ERROR')

      const ok = Result.ok<number, string>(10).mapErr((e) => e.toUpperCase())
      expect(ok.unwrap()).toBe(10)
    })
  })
})
