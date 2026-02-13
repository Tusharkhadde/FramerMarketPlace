import Joi from 'joi'

// Install: npm install joi

export const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid Indian phone number',
      'any.required': 'Phone number is required',
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
  userType: Joi.string().valid('farmer', 'buyer').required().messages({
    'any.only': 'User type must be farmer or buyer',
    'any.required': 'User type is required',
  }),
  district: Joi.when('userType', {
    is: 'farmer',
    then: Joi.string().required().messages({
      'any.required': 'District is required for farmers',
    }),
    otherwise: Joi.string().optional(),
  }),
  taluka: Joi.string().optional(),
  village: Joi.string().optional(),
  farmSize: Joi.number().min(0).optional(),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
})

export const productSchema = Joi.object({
  cropName: Joi.string().max(100).required(),
  category: Joi.string()
    .valid('vegetables', 'fruits', 'grains', 'pulses', 'spices', 'dairy', 'other')
    .required(),
  description: Joi.string().max(1000).optional(),
  quantityAvailable: Joi.number().min(0).required(),
  unit: Joi.string().valid('kg', 'quintal', 'ton', 'piece', 'dozen', 'litre').default('kg'),
  pricePerKg: Joi.number().min(0).required(),
  qualityGrade: Joi.string().valid('A', 'B', 'C').required(),
  harvestDate: Joi.date().required(),
  isOrganic: Joi.boolean().default(false),
  minimumOrder: Joi.number().min(1).default(1),
})

export const orderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
      })
    )
    .min(1)
    .required(),
  deliveryAddress: Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().optional(),
    city: Joi.string().optional(),
    district: Joi.string().required(),
    state: Joi.string().default('Maharashtra'),
    pincode: Joi.string().required(),
  }).required(),
  paymentMethod: Joi.string().valid('online', 'cod').required(),
  deliverySchedule: Joi.object({
    date: Joi.date().optional(),
    timeSlot: Joi.string().valid('morning', 'afternoon', 'evening').optional(),
  }).optional(),
})