const express = require('express');
const router = express.Router();
const PatientCare = require('../models/PatientCare');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Get or create patient care record
router.get('/patient-care/:patientId', async (req, res) => {
  try {
    let patientCare = await PatientCare.findOne({ patientId: req.params.patientId })
      .populate('remarks.doctorId', 'name specialization profilePhoto')
      .populate('assessments.doctorId', 'name specialization')
      .populate('medications.prescribedBy', 'name')
      .populate('progressNotes.doctorId', 'name')
      .populate('treatmentPlan.updatedBy', 'name');

    if (!patientCare) {
      // Create new record if doesn't exist
      patientCare = new PatientCare({ patientId: req.params.patientId });
      await patientCare.save();
    }

    res.json(patientCare);
  } catch (error) {
    console.error('Error fetching patient care:', error);
    res.status(500).json({ error: 'Failed to fetch patient care record' });
  }
});

// Get all patients with care records for a doctor
router.get('/patient-care/doctor/:doctorId', async (req, res) => {
  try {
    const patientCares = await PatientCare.find()
      .populate('patientId', 'name email phone profilePhoto')
      .sort({ updatedAt: -1 });

    res.json(patientCares);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Add remark/note
router.post('/patient-care/:patientId/remark', async (req, res) => {
  try {
    const { doctorId, remark, remarkType, isPrivate, appointmentId } = req.body;

    const patientCare = await PatientCare.findOne({ patientId: req.params.patientId });
    
    if (!patientCare) {
      return res.status(404).json({ error: 'Patient care record not found' });
    }

    patientCare.remarks.push({
      doctorId,
      remark,
      remarkType: remarkType || 'general',
      isPrivate: isPrivate || false,
      appointmentId
    });

    await patientCare.save();
    await patientCare.populate('remarks.doctorId', 'name specialization profilePhoto');

    res.json({ message: 'Remark added successfully', patientCare });
  } catch (error) {
    console.error('Error adding remark:', error);
    res.status(500).json({ error: 'Failed to add remark' });
  }
});

// Add medication
router.post('/patient-care/:patientId/medication', async (req, res) => {
  try {
    const { name, dosage, frequency, duration, instructions, prescribedBy, startDate, endDate } = req.body;

    const patientCare = await PatientCare.findOne({ patientId: req.params.patientId });
    
    if (!patientCare) {
      return res.status(404).json({ error: 'Patient care record not found' });
    }

    patientCare.medications.push({
      name,
      dosage,
      frequency,
      duration,
      instructions,
      prescribedBy,
      startDate: startDate || new Date(),
      endDate,
      status: 'active'
    });

    await patientCare.save();
    await patientCare.populate('medications.prescribedBy', 'name');

    res.json({ message: 'Medication added successfully', patientCare });
  } catch (error) {
    console.error('Error adding medication:', error);
    res.status(500).json({ error: 'Failed to add medication' });
  }
});

// Update medication status
router.patch('/patient-care/:patientId/medication/:medicationId', async (req, res) => {
  try {
    const { status } = req.body;

    const patientCare = await PatientCare.findOne({ patientId: req.params.patientId });
    
    if (!patientCare) {
      return res.status(404).json({ error: 'Patient care record not found' });
    }

    const medication = patientCare.medications.id(req.params.medicationId);
    if (medication) {
      medication.status = status;
      await patientCare.save();
      res.json({ message: 'Medication updated successfully', patientCare });
    } else {
      res.status(404).json({ error: 'Medication not found' });
    }
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

// Add diagnosis
router.post('/patient-care/:patientId/diagnosis', async (req, res) => {
  try {
    const { condition, diagnosedBy, status } = req.body;

    const patientCare = await PatientCare.findOne({ patientId: req.params.patientId });
    
    if (!patientCare) {
      return res.status(404).json({ error: 'Patient care record not found' });
    }

    patientCare.diagnosis.push({
      condition,
      diagnosedDate: new Date(),
      diagnosedBy,
      status: status || 'active'
    });

    await patientCare.save();

    res.json({ message: 'Diagnosis added successfully', patientCare });
  } catch (error) {
    console.error('Error adding diagnosis:', error);
    res.status(500).json({ error: 'Failed to add diagnosis' });
  }
});

// Update treatment plan
router.put('/patient-care/:patientId/treatment-plan', async (req, res) => {
  try {
    const { goals, approach, estimatedDuration, updatedBy } = req.body;

    const patientCare = await PatientCare.findOne({ patientId: req.params.patientId });
    
    if (!patientCare) {
      return res.status(404).json({ error: 'Patient care record not found' });
    }

    patientCare.treatmentPlan = {
      goals,
      approach,
      estimatedDuration,
      lastUpdated: new Date(),
      updatedBy
    };

    await patientCare.save();
    await patientCare.populate('treatmentPlan.updatedBy', 'name');

    res.json({ message: 'Treatment plan updated successfully', patientCare });
  } catch (error) {
    console.error('Error updating treatment plan:', error);
    res.status(500).json({ error: 'Failed to update treatment plan' });
  }
});

// Add progress note
router.post('/patient-care/:patientId/progress', async (req, res) => {
  try {
    const { doctorId, mood, note, improvements, concerns } = req.body;

    const patientCare = await PatientCare.findOne({ patientId: req.params.patientId });
    
    if (!patientCare) {
      return res.status(404).json({ error: 'Patient care record not found' });
    }

    patientCare.progressNotes.push({
      doctorId,
      mood,
      note,
      improvements: improvements || [],
      concerns: concerns || []
    });

    await patientCare.save();
    await patientCare.populate('progressNotes.doctorId', 'name');

    res.json({ message: 'Progress note added successfully', patientCare });
  } catch (error) {
    console.error('Error adding progress note:', error);
    res.status(500).json({ error: 'Failed to add progress note' });
  }
});

// Add assessment
router.post('/patient-care/:patientId/assessment', async (req, res) => {
  try {
    const { doctorId, assessmentType, scores, summary, severity } = req.body;

    const patientCare = await PatientCare.findOne({ patientId: req.params.patientId });
    
    if (!patientCare) {
      return res.status(404).json({ error: 'Patient care record not found' });
    }

    patientCare.assessments.push({
      doctorId,
      assessmentType,
      scores,
      summary,
      severity
    });

    await patientCare.save();
    await patientCare.populate('assessments.doctorId', 'name specialization');

    res.json({ message: 'Assessment added successfully', patientCare });
  } catch (error) {
    console.error('Error adding assessment:', error);
    res.status(500).json({ error: 'Failed to add assessment' });
  }
});

// Update risk level
router.patch('/patient-care/:patientId/risk', async (req, res) => {
  try {
    const { riskLevel } = req.body;

    const patientCare = await PatientCare.findOneAndUpdate(
      { patientId: req.params.patientId },
      { 
        riskLevel,
        lastRiskAssessment: new Date()
      },
      { new: true }
    );
    
    if (!patientCare) {
      return res.status(404).json({ error: 'Patient care record not found' });
    }

    res.json({ message: 'Risk level updated successfully', patientCare });
  } catch (error) {
    console.error('Error updating risk level:', error);
    res.status(500).json({ error: 'Failed to update risk level' });
  }
});

// Delete remark (soft delete - could add isDeleted field)
router.delete('/patient-care/:patientId/remark/:remarkId', async (req, res) => {
  try {
    const patientCare = await PatientCare.findOne({ patientId: req.params.patientId });
    
    if (!patientCare) {
      return res.status(404).json({ error: 'Patient care record not found' });
    }

    patientCare.remarks.id(req.params.remarkId).remove();
    await patientCare.save();

    res.json({ message: 'Remark deleted successfully' });
  } catch (error) {
    console.error('Error deleting remark:', error);
    res.status(500).json({ error: 'Failed to delete remark' });
  }
});

module.exports = router;
