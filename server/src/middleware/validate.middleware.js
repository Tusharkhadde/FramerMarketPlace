import { ApiError } from '../utils/apiError.js'

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false })
    
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ')
      return next(new ApiError(errorMessage, 400))
    }
    
    next()
  }
}