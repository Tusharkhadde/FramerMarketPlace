// export class ApiResponse {
//   constructor(statusCode, data, message = 'Success') {
//     this.success = statusCode < 400
//     this.statusCode = statusCode
//     this.message = message
//     this.data = data
//   }
// }

// export const sendResponse = (res, statusCode, data, message) => {
//   return res.status(statusCode).json(new ApiResponse(statusCode, data, message))
// }
export const sendResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}