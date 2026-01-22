import { NextFunction, Request, Response } from 'express'

import { ErrorResult } from '@/shared/result/errors'
import { ErrorResultToHttpStatusCode } from '@/shared/result/error-to-http-status'
import { HttpStatus } from '@/shared/result/http-status'
import { ProblemDetails, ProblemDetailsBuilder } from '@/shared/result/problem-details'

/**
 * Global error handler middleware following RFC 7807 Problem Details
 * This middleware catches all errors and formats them according to RFC 7807
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    return next(err)
  }

  let problemDetails: ProblemDetails

  if (err instanceof ErrorResult) {
    const status = ErrorResultToHttpStatusCode.mapFrom(err)
    const typeUri = `https://api.example.com/errors/${err.type}`

    const builder = ProblemDetailsBuilder.create(typeUri, err.type, status).withDetail(err.message)

    if (err.details && err.details.length > 0) {
      builder.withExtension('details', err.details)
    }

    problemDetails = builder.build()
  } else {
    const status = HttpStatus.INTERNAL_SERVER_ERROR
    const typeUri = 'https://api.example.com/errors/InternalServerError'

    problemDetails = ProblemDetailsBuilder.create(typeUri, 'Internal Server Error', status)
      .withDetail(process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message)
      .withInstance(req.originalUrl || req.url)
      .build()

    if (process.env.NODE_ENV !== 'production') {
      problemDetails.stack = err.stack
    }

    console.error('Unhandled error:', err)
  }

  res.status(problemDetails.status).type('application/problem+json').json(problemDetails)
}

/**
 * 404 Not Found handler
 * Creates a Problem Details response for routes that don't exist
 */
export function notFoundHandler(req: Request, res: Response): void {
  const problemDetails = ProblemDetailsBuilder.create(
    'https://api.example.com/errors/NotFound',
    'Not Found',
    HttpStatus.NOT_FOUND,
  )
    .withDetail(`The requested resource '${req.originalUrl}' was not found`)
    .withInstance(req.originalUrl || req.url)
    .withExtension('method', req.method)
    .build()

  res.status(HttpStatus.NOT_FOUND).type('application/problem+json').json(problemDetails)
}
