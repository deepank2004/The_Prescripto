import doctorModel from '../models/doctorModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'

// Change doctor availability
const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body || {}

        if (!docId) {
            return res.status(400).json({ success: false, message: "docId is required" })
        }

        const docData = await doctorModel.findById(docId)
        if (!docData) {
            return res.status(404).json({ success: false, message: "Doctor not found" })
        }

        await doctorModel.findByIdAndUpdate(docId, {
            available: !docData.available
        })

        res.json({ success: true, message: "Availability changed" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get doctor list
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel
            .find({})
            .select('-password -email') // ✅ fixed

        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Doctor login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body || {}

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" })
        }

        const doctor = await doctorModel.findOne({ email })
        if (!doctor) {
            return res.json({ success: false, message: "Invalid Credentials" })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" })
        }

        const token = jwt.sign(
            { id: doctor._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get doctor appointments
const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req.body || {}

        if (!docId) {
            return res.status(400).json({ success: false, message: "docId is required" })
        }

        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Mark appointment completed
const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body || {}

        if (!docId || !appointmentId) {
            return res.status(400).json({ success: false, message: "docId and appointmentId are required" })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (
            appointmentData &&
            appointmentData.docId.toString() === docId // ✅ fixed ObjectId comparison
        ) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                isCompleted: true
            })

            return res.json({ success: true, message: "Appointment Completed" })
        }

        res.json({ success: false, message: "Mark Failed" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Cancel appointment
const appointmentCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body || {}

        if (!docId || !appointmentId) {
            return res.status(400).json({ success: false, message: "docId and appointmentId are required" })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (
            appointmentData &&
            appointmentData.docId.toString() === docId // ✅ fixed ObjectId comparison
        ) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                cancelled: true
            })

            return res.json({ success: true, message: "Appointment Cancelled" })
        }

        res.json({ success: false, message: "Cancellation Failed" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Doctor dashboard
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body || {}

        if (!docId) {
            return res.status(400).json({ success: false, message: "docId is required" })
        }

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0
        let patients = []

        appointments.forEach((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }

            // ✅ fixed duplicate logic
            if (!patients.includes(item.userId.toString())) {
                patients.push(item.userId.toString())
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get doctor profile
const doctorProfile = async (req, res) => {
    try {
        const { docId } = req.body || {}

        if (!docId) {
            return res.status(400).json({ success: false, message: "docId is required" })
        }

        const profileData = await doctorModel
            .findById(docId)
            .select('-password') // ✅ fixed typo

        res.json({ success: true, profileData })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
    try {
        const { docId, fees, address, available } = req.body || {}

        if (!docId) {
            return res.status(400).json({ success: false, message: "docId is required" })
        }

        await doctorModel.findByIdAndUpdate(docId, {
            fees,
            address,
            available
        })

        res.json({ success: true, message: "Profile Updated" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

export {
    changeAvailability,
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile
}
