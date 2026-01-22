import { NextFunction, Request, Response } from 'express'
import { errorHandler, notFoundHandler } from '@/shared/middleware/error-handler'
import { ErrorResult } from '@/shared/result/errors'
import { HttpStatus } from '@/shared/result/http-status'

// A test-specific error class that extends ErrorResult
class TestError extends ErrorResult {
  constructor(message: string) {
    super(message, [])
  }
}

describe('Error Handling Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/test',
      url: '/test',
      method: 'GET',
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
  })

  describe('errorHandler', () => {
    it('should format an ErrorResult into an RFC 7807 Problem Details response', () => {
      const error = new TestError('A test error occurred.')

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

      // The default mapping for an unknown ErrorResult is BAD_REQUEST
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
      expect(mockResponse.type).toHaveBeenCalledWith('application/problem+json')
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.BAD_REQUEST,
          title: 'TestError',
          type: 'https://api.example.com/errors/TestError',
          detail: 'A test error occurred.',
        }),
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should format a generic Error into a 500 Problem Details response in production', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const error = new Error('Something broke')

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          title: 'Internal Server Error',
          detail: 'An unexpected error occurred',
        }),
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unhandled error:', error)
      process.env.NODE_ENV = originalNodeEnv
      consoleErrorSpy.mockRestore()
    })

    it('should format a generic Error with message and stack in development', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const error = new Error('Something broke')
      error.stack = 'stack trace'

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          title: 'Internal Server Error',
          detail: 'Something broke',
          stack: 'stack trace',
        }),
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unhandled error:', error)
      process.env.NODE_ENV = originalNodeEnv
      consoleErrorSpy.mockRestore()
    })

    it('should call next if headers have already been sent', () => {
      const error = new Error('Test error')
      mockResponse.headersSent = true

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(error)
      expect(mockResponse.status).not.toHaveBeenCalled()
      expect(mockResponse.json).not.toHaveBeenCalled()
    })
  })

  describe('notFoundHandler', () => {
    it('should create a 404 Problem Details response', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
      expect(mockResponse.type).toHaveBeenCalledWith('application/problem+json')
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.NOT_FOUND,
          title: 'Not Found',
          detail: "The requested resource '/test' was not found",
        }),
      )
    })
  })
})
