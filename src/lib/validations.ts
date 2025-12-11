import { z } from "zod";

// Customer Application Validation
export const customerApplicationSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  company_name: z.string().max(200, "Company name too long").optional().or(z.literal("")),
  company_address: z.string().min(1, "Address is required").max(500, "Address too long"),
  mc_number: z.string().min(1, "MC number is required").max(20, "MC number too long"),
  business_type: z.string().min(1, "Business type is required"),
  account_holder_name: z.string().min(1, "Account holder name is required").max(100),
  account_number: z.string().min(4, "Invalid account number").max(17, "Account number too long"),
  routing_number: z.string().regex(/^\d{9}$/, "Routing number must be exactly 9 digits"),
  bank_name: z.string().min(1, "Bank name is required").max(100),
  insurance_company: z.string().min(1, "Insurance company is required").max(100),
  secondary_contact_name: z.string().max(100).optional(),
  secondary_contact_phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional().or(z.literal("")),
  secondary_contact_relationship: z.string().max(50).optional(),
  message: z.string().max(2000, "Message must be less than 2000 characters").optional(),
});

// Authentication Validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Quick signup - just email + password for Login page
export const quickSignupSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Full signup - used by GetStarted page for complete registration
export const fullSignupSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
});

// File Upload Validation
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateFile = (file: File | null): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: "Invalid file type. Only JPEG, PNG, and PDF files are allowed." 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: "File too large. Maximum size is 5MB." 
    };
  }

  return { valid: true };
};

// Sanitize string inputs
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};
