# Homeopathy App V2 Walkthrough

## V2 Feature Summary

V2 moves appointment ownership from Admin to Doctor. Admin can manage doctors, diseases, and patient records, but can no longer approve, reject, or directly manage bookings from the admin dashboard.

Implemented V2 features:

- Admin Doctor Directory with doctor add, delete, and edit actions.
- Admin edit doctor modal for name, phone, username, optional password update, and fixed specialization checklist.
- Read-only Admin Doctor Schedules tab showing doctor availability from `GET /api/doctors`.
- Doctor portal appointment approval and rejection workflow.
- Doctor-controlled shift and availability settings.
- Patient appointment booking filtered by selected disease/specialization, with an override option to show all doctors.
- Patient records showing appointment status, prescriptions, invoices, and OPD reports.

## Admin Flow

Admin enters through `/admin/login` and lands on the Admin Dashboard.

Major admin screens:

- Dashboard Overview: high-level clinic metrics, appointment counts, revenue, top symptoms, doctor performance, and recent booking analytics.
- Doctor Master: add doctors, view Doctor Directory, edit doctor identity and specialization data, or delete doctors.
- Doctor Schedules: read-only schedule cards for each doctor. Admin sees working days, start and end time, slot duration, and blocked leave dates.
- Patient Directory: search patients, open medical files, inspect vitals, appointments, prescriptions, invoices, and OPD reports.
- Disease Master: add or delete disease names used by booking forms.

Admin edit doctor behavior:

- Click `Edit` in the Doctor Directory row.
- Update doctor name, phone, username, optional password, and specialization checklist.
- Leave password blank to keep the existing password.
- Save sends doctor updates to the backend without letting admin edit the doctor's schedule.

Admin endpoints:

- `POST /api/auth/login` for admin login.
- `GET /api/doctors` to load doctors and availability.
- `POST /api/doctors/add` to create doctors.
- `PUT /api/doctors/update/:id` to update doctor details and specializations.
- `DELETE /api/doctors/delete/:id` to remove a doctor.
- `GET /api/diseases` to load diseases.
- `POST /api/diseases/add` to add diseases.
- `DELETE /api/diseases/delete/:id` to remove diseases.
- `GET /api/patients` to load the patient directory.
- `GET /api/patients/profile/:patientId` to load patient medical history.

## Doctor Flow

Doctors log in from the homepage LoginModal. Their JWT-related identity is stored in localStorage, including doctor ID and doctor name.

Major doctor screens:

- Consultations Desk: pending, today's approved, and all assigned appointments.
- Patient Search Lookup: find patient records by ID, name, or mobile.
- Reappointment Lookup: fetch a returning patient directly by Patient ID.
- Clinical Consultation Desk: write prescriptions, log vitals, recovery status, notes, and follow-up date.
- Historical Consultations & Vitals Timeline: review previous treatment records.
- Shift & Availability Settings: configure working days, start time, end time, slot duration, and blocked dates.

Doctor appointment behavior:

- Pending bookings appear under the Pending filter.
- Doctor can approve or reject each pending appointment.
- Approved appointments appear in today's consultation workflow when the appointment date matches the current date.
- Patient records reflect the appointment status after update.

Doctor endpoints:

- `POST /api/auth/doctor/login` for doctor login.
- `GET /api/doctor/appointments?doctorId=:id` to load assigned appointments.
- `PATCH /api/appointments/:id` to approve or reject appointments.
- `POST /api/doctor/shifts` to save availability.
- `GET /api/doctors` to load the current doctor's saved availability.
- `GET /api/patients/search?q=:query` to search patients.
- `GET /api/patients/profile/:patientId` to load a patient file.
- `POST /api/prescriptions/add` to save prescriptions.
- `POST /api/health-records/add` to save vitals and recovery status.

## Patient Flow

Patients use the homepage appointment booking form.

Major patient screens:

- Appointment Booking: new patient and reappointment tabs.
- Doctor Selection: doctors are filtered by the selected disease/problem.
- Slot Selection: available slots load after selecting doctor and date.
- Patient Dashboard: appointment history and current status.
- Patient Record and Report pages: invoices, OPD report, prescription history, and billing summary.

Patient booking behavior:

- Patient selects a disease/problem.
- Doctor dropdown shows only doctors whose `specializations` include that disease.
- Patient can choose `Show all doctors (ignore specialization filter)` to override the match.
- Booking is created with `Pending` status.
- Doctor approval or rejection updates the patient's appointment status.

Patient endpoints:

- `GET /api/doctors` to load doctors and specializations.
- `GET /api/diseases` to load disease/problem options.
- `GET /api/slots?doctorId=:id&date=:date` to load available appointment slots.
- `POST /api/appointments` to create a new appointment or reappointment.
- `GET /api/patients/profile/:patientId` to load appointment and medical records.

## Doctor Schedule Data

Doctor availability is read from the `availability` JSON field returned by `GET /api/doctors`.

Expected availability shape:

```json
{
  "days": ["Monday", "Tuesday", "Wednesday"],
  "startTime": "10:00 AM",
  "endTime": "01:00 PM",
  "slotDuration": 30,
  "blockedDates": ["2026-06-30"]
}
```

The Admin Dashboard displays this data in read-only cards. Doctors edit it from the Doctor Portal only.

## End-To-End Verification Checklist

Use these flows after the backend and frontend are running:

- Admin logs in at `/admin/login`, opens Doctor Master, clicks Edit on a doctor, changes specializations, and saves successfully.
- Admin opens Doctor Schedules and sees each doctor's working days, time range, slot duration, and blocked dates.
- Patient selects a disease while booking and sees doctors matching that specialization, unless the override checkbox is enabled.
- Patient submits an appointment and it appears as Pending for the assigned doctor.
- Doctor logs in, opens Pending appointments, approves or rejects the appointment.
- Patient record/dashboard shows the updated appointment status.
