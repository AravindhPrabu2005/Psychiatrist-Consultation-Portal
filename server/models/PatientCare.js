const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  instructions: { type: String },
  prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'discontinued'], 
    default: 'active' 
  }
}, { timestamps: true });

const remarkSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  remark: { type: String, required: true },
  remarkType: { 
    type: String, 
    enum: ['general', 'session_notes', 'diagnosis', 'improvement', 'concern', 'follow_up'],
    default: 'general'
  },
  isPrivate: { type: Boolean, default: false },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
}, { timestamps: true });

const assessmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  assessmentType: { 
    type: String, 
    enum: ['PHQ-9', 'GAD-7', 'Custom', 'Initial', 'Follow-up'],
    required: true
  },
  scores: { type: Map, of: String },
  summary: { type: String },
  severity: { 
    type: String, 
    enum: ['Minimal', 'Mild', 'Moderate', 'Severe', 'Very Severe'] 
  }
}, { timestamps: true });

const patientCareSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  
  // Medical History
  diagnosis: [{ 
    condition: String, 
    diagnosedDate: Date,
    diagnosedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    status: { type: String, enum: ['active', 'resolved', 'chronic'], default: 'active' }
  }],
  
  allergies: [String],
  
  // Medications
  medications: [medicationSchema],
  
  // Doctor Remarks/Notes
  remarks: [remarkSchema],
  
  // Assessments
  assessments: [assessmentSchema],
  
  // Treatment Plan
  treatmentPlan: {
    goals: [String],
    approach: String,
    estimatedDuration: String,
    lastUpdated: Date,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
  },
  
  // Progress Tracking
  progressNotes: [{
    date: { type: Date, default: Date.now },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    mood: { type: String, enum: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'] },
    note: String,
    improvements: [String],
    concerns: [String]
  }],
  
  // Risk Assessment
  riskLevel: { 
    type: String, 
    enum: ['Low', 'Moderate', 'High', 'Critical'],
    default: 'Low'
  },
  lastRiskAssessment: Date,
  
  // Follow-up
  nextFollowUp: Date,
  followUpFrequency: String
  
}, { timestamps: true });

// Index for faster queries
patientCareSchema.index({ patientId: 1 });
patientCareSchema.index({ 'remarks.doctorId': 1 });

module.exports = mongoose.model('PatientCare', patientCareSchema);
