import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import axiosInstance from '../../axiosInstance';
import { 
  UserCircle2, 
  FileText, 
  Pill, 
  Activity, 
  AlertTriangle,
  Plus,
  X,
  Calendar,
  TrendingUp,
  ClipboardList,
  Stethoscope,
  Eye,
  Search,
  Filter
} from 'lucide-react';

const PatientCare = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientCareData, setPatientCareData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const adminId = localStorage.getItem('id');

  // Form states
  const [remarkForm, setRemarkForm] = useState({
    remark: '',
    remarkType: 'general',
    isPrivate: false
  });

  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [diagnosisForm, setDiagnosisForm] = useState({
    condition: '',
    status: 'active'
  });

  const [treatmentPlanForm, setTreatmentPlanForm] = useState({
    goals: [''],
    approach: '',
    estimatedDuration: ''
  });

  const [progressForm, setProgressForm] = useState({
    mood: 'Fair',
    note: '',
    improvements: [''],
    concerns: ['']
  });

  useEffect(() => {
    fetchPatients();
  }, [adminId]);

  const fetchPatients = async () => {
    try {
      const response = await axiosInstance.get(`/messenger/getPatients/${adminId}`);
      setPatients(response.data);
    } catch (error) {
      console.log('Error fetching patients:', error);
    }
  };

  const fetchPatientCare = async (patientId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/patient-care/${patientId}`);
      setPatientCareData(response.data);
    } catch (error) {
      console.error('Error fetching patient care:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchPatientCare(patient._id);
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    resetForms();
  };

  const resetForms = () => {
    setRemarkForm({ remark: '', remarkType: 'general', isPrivate: false });
    setMedicationForm({ name: '', dosage: '', frequency: '', duration: '', instructions: '', startDate: new Date().toISOString().split('T')[0] });
    setDiagnosisForm({ condition: '', status: 'active' });
    setTreatmentPlanForm({ goals: [''], approach: '', estimatedDuration: '' });
    setProgressForm({ mood: 'Fair', note: '', improvements: [''], concerns: [''] });
  };

  // Add Remark
  const handleAddRemark = async () => {
    try {
      await axiosInstance.post(`/patient-care/${selectedPatient._id}/remark`, {
        ...remarkForm,
        doctorId: adminId
      });
      alert('Remark added successfully!');
      fetchPatientCare(selectedPatient._id);
      closeModal();
    } catch (error) {
      console.error('Error adding remark:', error);
      alert('Failed to add remark');
    }
  };

  // Add Medication
  const handleAddMedication = async () => {
    try {
      await axiosInstance.post(`/patient-care/${selectedPatient._id}/medication`, {
        ...medicationForm,
        prescribedBy: adminId
      });
      alert('Medication added successfully!');
      fetchPatientCare(selectedPatient._id);
      closeModal();
    } catch (error) {
      console.error('Error adding medication:', error);
      alert('Failed to add medication');
    }
  };

  // Add Diagnosis
  const handleAddDiagnosis = async () => {
    try {
      await axiosInstance.post(`/patient-care/${selectedPatient._id}/diagnosis`, {
        ...diagnosisForm,
        diagnosedBy: adminId
      });
      alert('Diagnosis added successfully!');
      fetchPatientCare(selectedPatient._id);
      closeModal();
    } catch (error) {
      console.error('Error adding diagnosis:', error);
      alert('Failed to add diagnosis');
    }
  };

  // Update Treatment Plan
  const handleUpdateTreatmentPlan = async () => {
    try {
      await axiosInstance.put(`/patient-care/${selectedPatient._id}/treatment-plan`, {
        ...treatmentPlanForm,
        updatedBy: adminId
      });
      alert('Treatment plan updated successfully!');
      fetchPatientCare(selectedPatient._id);
      closeModal();
    } catch (error) {
      console.error('Error updating treatment plan:', error);
      alert('Failed to update treatment plan');
    }
  };

  // Add Progress Note
  const handleAddProgress = async () => {
    try {
      await axiosInstance.post(`/patient-care/${selectedPatient._id}/progress`, {
        ...progressForm,
        doctorId: adminId
      });
      alert('Progress note added successfully!');
      fetchPatientCare(selectedPatient._id);
      closeModal();
    } catch (error) {
      console.error('Error adding progress note:', error);
      alert('Failed to add progress note');
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getRemarkTypeColor = (type) => {
    const colors = {
      general: 'bg-gray-100 text-gray-700',
      session_notes: 'bg-blue-100 text-blue-700',
      diagnosis: 'bg-purple-100 text-purple-700',
      improvement: 'bg-green-100 text-green-700',
      concern: 'bg-red-100 text-red-700',
      follow_up: 'bg-orange-100 text-orange-700'
    };
    return colors[type] || colors.general;
  };

  const getRiskColor = (risk) => {
    const colors = {
      Low: 'bg-green-100 text-green-700 border-green-300',
      Moderate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      High: 'bg-orange-100 text-orange-700 border-orange-300',
      Critical: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[risk] || colors.Low;
  };

  return (
    <>
      <AdminNavbar />
      <div className="pt-28 px-4 max-w-7xl mx-auto pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Patient Care Management</h2>
            <p className="text-gray-600 mt-1">Comprehensive care records and treatment tracking</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Patient List Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No patients found</p>
                ) : (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient._id}
                      onClick={() => handlePatientSelect(patient)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                        selectedPatient?._id === patient._id
                          ? 'bg-[#2ADA71] text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {patient.profilePhoto ? (
                        <img
                          src={patient.profilePhoto}
                          alt={patient.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircle2 size={40} className="text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{patient.name}</p>
                        <p className={`text-sm truncate ${selectedPatient?._id === patient._id ? 'text-white/80' : 'text-gray-500'}`}>
                          {patient.email}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Patient Care Details */}
          <div className="col-span-12 lg:col-span-8">
            {!selectedPatient ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Stethoscope className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-gray-500 text-lg">Select a patient to view their care records</p>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ADA71] mb-4"></div>
                <p className="text-gray-500">Loading patient data...</p>
              </div>
            ) : (
              <>
                {/* Patient Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {selectedPatient.profilePhoto ? (
                        <img
                          src={selectedPatient.profilePhoto}
                          alt={selectedPatient.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-[#2ADA71]"
                        />
                      ) : (
                        <UserCircle2 size={80} className="text-gray-400" />
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{selectedPatient.name}</h3>
                        <p className="text-gray-600">{selectedPatient.email}</p>
                        <p className="text-gray-600">{selectedPatient.phone}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border-2 ${getRiskColor(patientCareData?.riskLevel)}`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={18} />
                        <span className="font-semibold">Risk: {patientCareData?.riskLevel || 'Low'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <FileText className="mx-auto text-blue-600 mb-1" size={24} />
                      <p className="text-2xl font-bold text-blue-600">{patientCareData?.remarks?.length || 0}</p>
                      <p className="text-xs text-gray-600">Remarks</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <Pill className="mx-auto text-green-600 mb-1" size={24} />
                      <p className="text-2xl font-bold text-green-600">
                        {patientCareData?.medications?.filter(m => m.status === 'active').length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Active Meds</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <ClipboardList className="mx-auto text-purple-600 mb-1" size={24} />
                      <p className="text-2xl font-bold text-purple-600">{patientCareData?.assessments?.length || 0}</p>
                      <p className="text-xs text-gray-600">Assessments</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <TrendingUp className="mx-auto text-orange-600 mb-1" size={24} />
                      <p className="text-2xl font-bold text-orange-600">{patientCareData?.progressNotes?.length || 0}</p>
                      <p className="text-xs text-gray-600">Progress Notes</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                  <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                      {['overview', 'remarks', 'medications', 'treatment', 'progress'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                            activeTab === tab
                              ? 'border-[#2ADA71] text-[#2ADA71]'
                              : 'border-transparent text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Diagnosis */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Stethoscope size={20} className="text-[#2ADA71]" />
                              Diagnosis
                            </h4>
                            <button
                              onClick={() => openModal('diagnosis')}
                              className="text-sm text-[#2ADA71] hover:underline"
                            >
                              + Add Diagnosis
                            </button>
                          </div>
                          {patientCareData?.diagnosis?.length > 0 ? (
                            <div className="space-y-2">
                              {patientCareData.diagnosis.map((diag, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="font-medium text-gray-800">{diag.condition}</p>
                                    <p className="text-sm text-gray-600">
                                      Diagnosed: {formatDate(diag.diagnosedDate)}
                                    </p>
                                  </div>
                                  <span className={`px-3 py-1 text-xs rounded-full ${
                                    diag.status === 'active' ? 'bg-green-100 text-green-700' :
                                    diag.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
                                    'bg-orange-100 text-orange-700'
                                  }`}>
                                    {diag.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No diagnosis recorded</p>
                          )}
                        </div>

                        {/* Active Medications Summary */}
                        <div>
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                            <Pill size={20} className="text-[#2ADA71]" />
                            Current Medications
                          </h4>
                          {patientCareData?.medications?.filter(m => m.status === 'active').length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {patientCareData.medications
                                .filter(m => m.status === 'active')
                                .slice(0, 4)
                                .map((med, idx) => (
                                  <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <p className="font-medium text-gray-800">{med.name}</p>
                                    <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No active medications</p>
                          )}
                        </div>

                        {/* Recent Remarks */}
                        <div>
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                            <FileText size={20} className="text-[#2ADA71]" />
                            Recent Remarks
                          </h4>
                          {patientCareData?.remarks?.length > 0 ? (
                            <div className="space-y-2">
                              {patientCareData.remarks.slice(-3).reverse().map((remark, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-800">
                                        Dr. {remark.doctorId?.name}
                                      </span>
                                      <span className={`px-2 py-0.5 text-xs rounded-full ${getRemarkTypeColor(remark.remarkType)}`}>
                                        {remark.remarkType.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">{formatDate(remark.createdAt)}</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{remark.remark}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No remarks recorded</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Remarks Tab */}
                    {activeTab === 'remarks' && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-gray-800">All Remarks & Notes</h4>
                          <button
                            onClick={() => openModal('remark')}
                            className="bg-[#2ADA71] hover:bg-[#25c063] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                          >
                            <Plus size={18} />
                            Add Remark
                          </button>
                        </div>

                        {patientCareData?.remarks?.length > 0 ? (
                          <div className="space-y-3">
                            {patientCareData.remarks.reverse().map((remark, idx) => (
                              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    {remark.doctorId?.profilePhoto ? (
                                      <img
                                        src={remark.doctorId.profilePhoto}
                                        alt={remark.doctorId.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                      />
                                    ) : (
                                      <UserCircle2 size={40} className="text-gray-400" />
                                    )}
                                    <div>
                                      <p className="font-semibold text-gray-800">
                                        Dr. {remark.doctorId?.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {remark.doctorId?.specialization}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getRemarkTypeColor(remark.remarkType)}`}>
                                      {remark.remarkType.replace('_', ' ')}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">{formatDate(remark.createdAt)}</p>
                                  </div>
                                </div>
                                <p className="text-gray-700">{remark.remark}</p>
                                {remark.isPrivate && (
                                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                    <Eye size={12} />
                                    Private Note
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                            <p className="text-gray-500">No remarks recorded yet</p>
                            <button
                              onClick={() => openModal('remark')}
                              className="mt-4 text-[#2ADA71] hover:underline"
                            >
                              Add your first remark
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Medications Tab */}
                    {activeTab === 'medications' && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-gray-800">Medication Plan</h4>
                          <button
                            onClick={() => openModal('medication')}
                            className="bg-[#2ADA71] hover:bg-[#25c063] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                          >
                            <Plus size={18} />
                            Add Medication
                          </button>
                        </div>

                        {patientCareData?.medications?.length > 0 ? (
                          <div className="space-y-4">
                            {/* Active Medications */}
                            <div>
                              <h5 className="font-semibold text-green-700 mb-3">Active Medications</h5>
                              <div className="grid gap-3">
                                {patientCareData.medications
                                  .filter(med => med.status === 'active')
                                  .map((med, idx) => (
                                    <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                                      <div className="flex justify-between items-start mb-2">
                                        <div>
                                          <h6 className="font-semibold text-gray-800 text-lg">{med.name}</h6>
                                          <p className="text-sm text-gray-600">
                                            Prescribed by: Dr. {med.prescribedBy?.name}
                                          </p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-200 text-green-800 text-xs rounded-full font-medium">
                                          Active
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                        <div>
                                          <p className="text-gray-600">Dosage</p>
                                          <p className="font-medium text-gray-800">{med.dosage}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600">Frequency</p>
                                          <p className="font-medium text-gray-800">{med.frequency}</p>
                                        </div>
                                        {med.duration && (
                                          <div>
                                            <p className="text-gray-600">Duration</p>
                                            <p className="font-medium text-gray-800">{med.duration}</p>
                                          </div>
                                        )}
                                        <div>
                                          <p className="text-gray-600">Started</p>
                                          <p className="font-medium text-gray-800">{formatDate(med.startDate)}</p>
                                        </div>
                                      </div>
                                      {med.instructions && (
                                        <div className="mt-3 p-2 bg-white rounded border border-green-200">
                                          <p className="text-xs text-gray-600">Instructions:</p>
                                          <p className="text-sm text-gray-800">{med.instructions}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>

                            {/* Past Medications */}
                            {patientCareData.medications.filter(med => med.status !== 'active').length > 0 && (
                              <div>
                                <h5 className="font-semibold text-gray-700 mb-3">Past Medications</h5>
                                <div className="grid gap-3">
                                  {patientCareData.medications
                                    .filter(med => med.status !== 'active')
                                    .map((med, idx) => (
                                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h6 className="font-semibold text-gray-800">{med.name}</h6>
                                            <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                                          </div>
                                          <span className={`px-3 py-1 text-xs rounded-full ${
                                            med.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                          }`}>
                                            {med.status}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <Pill className="mx-auto text-gray-400 mb-3" size={48} />
                            <p className="text-gray-500">No medications prescribed yet</p>
                            <button
                              onClick={() => openModal('medication')}
                              className="mt-4 text-[#2ADA71] hover:underline"
                            >
                              Prescribe first medication
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Treatment Plan Tab */}
                    {activeTab === 'treatment' && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-gray-800">Treatment Plan</h4>
                          <button
                            onClick={() => openModal('treatment')}
                            className="bg-[#2ADA71] hover:bg-[#25c063] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                          >
                            <Plus size={18} />
                            {patientCareData?.treatmentPlan?.goals ? 'Update Plan' : 'Create Plan'}
                          </button>
                        </div>

                        {patientCareData?.treatmentPlan?.goals ? (
                          <div className="space-y-6">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h5 className="font-semibold text-gray-800 mb-3">Treatment Goals</h5>
                              <ul className="space-y-2">
                                {patientCareData.treatmentPlan.goals.map((goal, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">✓</span>
                                    <span className="text-gray-700">{goal}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {patientCareData.treatmentPlan.approach && (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <h5 className="font-semibold text-gray-800 mb-2">Treatment Approach</h5>
                                <p className="text-gray-700">{patientCareData.treatmentPlan.approach}</p>
                              </div>
                            )}

                            {patientCareData.treatmentPlan.estimatedDuration && (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <h5 className="font-semibold text-gray-800 mb-2">Estimated Duration</h5>
                                <p className="text-gray-700">{patientCareData.treatmentPlan.estimatedDuration}</p>
                              </div>
                            )}

                            {patientCareData.treatmentPlan.lastUpdated && (
                              <p className="text-sm text-gray-500">
                                Last updated: {formatDate(patientCareData.treatmentPlan.lastUpdated)} by Dr. {patientCareData.treatmentPlan.updatedBy?.name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <ClipboardList className="mx-auto text-gray-400 mb-3" size={48} />
                            <p className="text-gray-500">No treatment plan created yet</p>
                            <button
                              onClick={() => openModal('treatment')}
                              className="mt-4 text-[#2ADA71] hover:underline"
                            >
                              Create treatment plan
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Progress Notes Tab */}
                    {activeTab === 'progress' && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-gray-800">Progress Tracking</h4>
                          <button
                            onClick={() => openModal('progress')}
                            className="bg-[#2ADA71] hover:bg-[#25c063] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                          >
                            <Plus size={18} />
                            Add Progress Note
                          </button>
                        </div>

                        {patientCareData?.progressNotes?.length > 0 ? (
                          <div className="space-y-4">
                            {patientCareData.progressNotes.reverse().map((note, idx) => (
                              <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-3">
                                    <Calendar className="text-blue-600" size={20} />
                                    <div>
                                      <p className="font-semibold text-gray-800">{formatDate(note.date)}</p>
                                      <p className="text-sm text-gray-600">Dr. {note.doctorId?.name}</p>
                                    </div>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    note.mood === 'Excellent' ? 'bg-green-200 text-green-800' :
                                    note.mood === 'Good' ? 'bg-blue-200 text-blue-800' :
                                    note.mood === 'Fair' ? 'bg-yellow-200 text-yellow-800' :
                                    note.mood === 'Poor' ? 'bg-orange-200 text-orange-800' :
                                    'bg-red-200 text-red-800'
                                  }`}>
                                    Mood: {note.mood}
                                  </span>
                                </div>

                                <p className="text-gray-700 mb-3">{note.note}</p>

                                {note.improvements?.length > 0 && (
                                  <div className="mb-2">
                                    <p className="text-sm font-semibold text-green-700 mb-1">✓ Improvements:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                      {note.improvements.map((imp, i) => (
                                        <li key={i}>{imp}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {note.concerns?.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-red-700 mb-1">! Concerns:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                      {note.concerns.map((concern, i) => (
                                        <li key={i}>{concern}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <TrendingUp className="mx-auto text-gray-400 mb-3" size={48} />
                            <p className="text-gray-500">No progress notes recorded yet</p>
                            <button
                              onClick={() => openModal('progress')}
                              className="mt-4 text-[#2ADA71] hover:underline"
                            >
                              Add first progress note
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {modalType === 'remark' && 'Add Remark / Note'}
                  {modalType === 'medication' && 'Prescribe Medication'}
                  {modalType === 'diagnosis' && 'Add Diagnosis'}
                  {modalType === 'treatment' && 'Update Treatment Plan'}
                  {modalType === 'progress' && 'Add Progress Note'}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              {/* Remark Form */}
              {modalType === 'remark' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remark Type</label>
                    <select
                      value={remarkForm.remarkType}
                      onChange={(e) => setRemarkForm({...remarkForm, remarkType: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                    >
                      <option value="general">General Note</option>
                      <option value="session_notes">Session Notes</option>
                      <option value="diagnosis">Diagnosis Note</option>
                      <option value="improvement">Improvement</option>
                      <option value="concern">Concern</option>
                      <option value="follow_up">Follow-up</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remark</label>
                    <textarea
                      rows="6"
                      value={remarkForm.remark}
                      onChange={(e) => setRemarkForm({...remarkForm, remark: e.target.value})}
                      placeholder="Enter detailed notes about the patient..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={remarkForm.isPrivate}
                      onChange={(e) => setRemarkForm({...remarkForm, isPrivate: e.target.checked})}
                      className="w-4 h-4 text-[#2ADA71] rounded focus:ring-2 focus:ring-[#2ADA71]"
                    />
                    <label htmlFor="isPrivate" className="text-sm text-gray-700">
                      Make this a private note (visible only to you)
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddRemark}
                      disabled={!remarkForm.remark.trim()}
                      className={`px-6 py-2 rounded-lg text-white ${
                        remarkForm.remark.trim()
                          ? 'bg-[#2ADA71] hover:bg-[#25c063]'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add Remark
                    </button>
                  </div>
                </div>
              )}

              {/* Medication Form */}
              {modalType === 'medication' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Medication Name *</label>
                      <input
                        type="text"
                        value={medicationForm.name}
                        onChange={(e) => setMedicationForm({...medicationForm, name: e.target.value})}
                        placeholder="e.g., Sertraline"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dosage *</label>
                      <input
                        type="text"
                        value={medicationForm.dosage}
                        onChange={(e) => setMedicationForm({...medicationForm, dosage: e.target.value})}
                        placeholder="e.g., 50mg"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frequency *</label>
                      <input
                        type="text"
                        value={medicationForm.frequency}
                        onChange={(e) => setMedicationForm({...medicationForm, frequency: e.target.value})}
                        placeholder="e.g., Once daily"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <input
                        type="text"
                        value={medicationForm.duration}
                        onChange={(e) => setMedicationForm({...medicationForm, duration: e.target.value})}
                        placeholder="e.g., 3 months"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={medicationForm.startDate}
                      onChange={(e) => setMedicationForm({...medicationForm, startDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                    <textarea
                      rows="3"
                      value={medicationForm.instructions}
                      onChange={(e) => setMedicationForm({...medicationForm, instructions: e.target.value})}
                      placeholder="e.g., Take with food, avoid alcohol..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddMedication}
                      disabled={!medicationForm.name || !medicationForm.dosage || !medicationForm.frequency}
                      className={`px-6 py-2 rounded-lg text-white ${
                        medicationForm.name && medicationForm.dosage && medicationForm.frequency
                          ? 'bg-[#2ADA71] hover:bg-[#25c063]'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Prescribe Medication
                    </button>
                  </div>
                </div>
              )}

              {/* Diagnosis Form */}
              {modalType === 'diagnosis' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition / Diagnosis *</label>
                    <input
                      type="text"
                      value={diagnosisForm.condition}
                      onChange={(e) => setDiagnosisForm({...diagnosisForm, condition: e.target.value})}
                      placeholder="e.g., Major Depressive Disorder, Generalized Anxiety Disorder"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={diagnosisForm.status}
                      onChange={(e) => setDiagnosisForm({...diagnosisForm, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="resolved">Resolved</option>
                      <option value="chronic">Chronic</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddDiagnosis}
                      disabled={!diagnosisForm.condition.trim()}
                      className={`px-6 py-2 rounded-lg text-white ${
                        diagnosisForm.condition.trim()
                          ? 'bg-[#2ADA71] hover:bg-[#25c063]'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add Diagnosis
                    </button>
                  </div>
                </div>
              )}

              {/* Treatment Plan Form */}
              {modalType === 'treatment' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Goals</label>
                    {treatmentPlanForm.goals.map((goal, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={goal}
                          onChange={(e) => {
                            const newGoals = [...treatmentPlanForm.goals];
                            newGoals[idx] = e.target.value;
                            setTreatmentPlanForm({...treatmentPlanForm, goals: newGoals});
                          }}
                          placeholder={`Goal ${idx + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                        />
                        {treatmentPlanForm.goals.length > 1 && (
                          <button
                            onClick={() => {
                              const newGoals = treatmentPlanForm.goals.filter((_, i) => i !== idx);
                              setTreatmentPlanForm({...treatmentPlanForm, goals: newGoals});
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setTreatmentPlanForm({...treatmentPlanForm, goals: [...treatmentPlanForm.goals, '']})}
                      className="text-sm text-[#2ADA71] hover:underline"
                    >
                      + Add another goal
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Approach</label>
                    <textarea
                      rows="4"
                      value={treatmentPlanForm.approach}
                      onChange={(e) => setTreatmentPlanForm({...treatmentPlanForm, approach: e.target.value})}
                      placeholder="Describe the treatment approach (e.g., CBT, medication, therapy combination...)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration</label>
                    <input
                      type="text"
                      value={treatmentPlanForm.estimatedDuration}
                      onChange={(e) => setTreatmentPlanForm({...treatmentPlanForm, estimatedDuration: e.target.value})}
                      placeholder="e.g., 6 months, 1 year"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateTreatmentPlan}
                      disabled={treatmentPlanForm.goals.every(g => !g.trim())}
                      className={`px-6 py-2 rounded-lg text-white ${
                        treatmentPlanForm.goals.some(g => g.trim())
                          ? 'bg-[#2ADA71] hover:bg-[#25c063]'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Update Treatment Plan
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Note Form */}
              {modalType === 'progress' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient Mood</label>
                    <select
                      value={progressForm.mood}
                      onChange={(e) => setProgressForm({...progressForm, mood: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                    >
                      <option value="Very Poor">Very Poor</option>
                      <option value="Poor">Poor</option>
                      <option value="Fair">Fair</option>
                      <option value="Good">Good</option>
                      <option value="Excellent">Excellent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Progress Note</label>
                    <textarea
                      rows="4"
                      value={progressForm.note}
                      onChange={(e) => setProgressForm({...progressForm, note: e.target.value})}
                      placeholder="Describe the patient's progress, behavior, response to treatment..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Improvements Noted</label>
                    {progressForm.improvements.map((imp, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={imp}
                          onChange={(e) => {
                            const newImprovements = [...progressForm.improvements];
                            newImprovements[idx] = e.target.value;
                            setProgressForm({...progressForm, improvements: newImprovements});
                          }}
                          placeholder={`Improvement ${idx + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                        />
                        {progressForm.improvements.length > 1 && (
                          <button
                            onClick={() => {
                              const newImprovements = progressForm.improvements.filter((_, i) => i !== idx);
                              setProgressForm({...progressForm, improvements: newImprovements});
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setProgressForm({...progressForm, improvements: [...progressForm.improvements, '']})}
                      className="text-sm text-green-600 hover:underline"
                    >
                      + Add improvement
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Concerns</label>
                    {progressForm.concerns.map((concern, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={concern}
                          onChange={(e) => {
                            const newConcerns = [...progressForm.concerns];
                            newConcerns[idx] = e.target.value;
                            setProgressForm({...progressForm, concerns: newConcerns});
                          }}
                          placeholder={`Concern ${idx + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] outline-none"
                        />
                        {progressForm.concerns.length > 1 && (
                          <button
                            onClick={() => {
                              const newConcerns = progressForm.concerns.filter((_, i) => i !== idx);
                              setProgressForm({...progressForm, concerns: newConcerns});
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setProgressForm({...progressForm, concerns: [...progressForm.concerns, '']})}
                      className="text-sm text-red-600 hover:underline"
                    >
                      + Add concern
                    </button>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddProgress}
                      disabled={!progressForm.note.trim()}
                      className={`px-6 py-2 rounded-lg text-white ${
                        progressForm.note.trim()
                          ? 'bg-[#2ADA71] hover:bg-[#25c063]'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add Progress Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientCare;
