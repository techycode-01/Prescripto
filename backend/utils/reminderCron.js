import cron from 'node-cron';
import appointmentModel from '../models/appointmentModel.js';
import sendEmail from './SendEmail.js';
import slotDateFormat from './slotDateFormat.js';

/**
 * Parses a slotDate string like "5_3_2026" and a slotTime like "10:00 AM"
 * into a proper JavaScript Date object for comparison.
 */
const parseAppointmentDate = (slotDate, slotTime) => {
    const [day, month, year] = slotDate.split('_').map(Number);
    const date = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${slotTime}`);
    return date;
};

/**
 * Scans upcoming appointments and sends reminder emails 24 hours in advance.
 * Runs every day at 8:00 AM server time.
 */
const startReminderCron = () => {
    cron.schedule('0 8 * * *', async () => {
        console.log('[Cron] Running daily appointment reminder job...');
        try {
            // Fetch all upcoming, non-cancelled, non-completed appointments
            const appointments = await appointmentModel.find({
                cancelled: false,
                isCompleted: false,
            });

            const now = new Date();
            const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

            const upcomingAppointments = appointments.filter((appt) => {
                const apptTime = parseAppointmentDate(appt.slotDate, appt.slotTime);
                // Only remind for appointments within the next 24–25 hour window
                return apptTime > in24h && apptTime <= in25h;
            });

            if (upcomingAppointments.length === 0) {
                console.log('[Cron] No upcoming appointments to remind.');
                return;
            }

            console.log(`[Cron] Sending ${upcomingAppointments.length} reminder email(s)...`);

            for (const appt of upcomingAppointments) {
                const { userData, docData, slotDate, slotTime } = appt;
                const dateStr = slotDateFormat(slotDate) + ' at ' + slotTime;

                await Promise.all([
                    sendEmail({
                        to: userData.email,
                        subject: 'Appointment Reminder - Prescripto',
                        text: `Dear ${userData.name},\n\nThis is a reminder that you have an appointment with ${docData.name} tomorrow on ${dateStr}.\n\nPlease be on time. Thank you for choosing Prescripto!`
                    }),
                    sendEmail({
                        to: docData.email,
                        subject: 'Upcoming Appointment Reminder - Prescripto',
                        text: `Dear ${docData.name},\n\nThis is a reminder that you have an appointment with patient ${userData.name} tomorrow on ${dateStr}.\n\nPlease check your dashboard for more details.`
                    }),
                ]);
            }

            console.log('[Cron] Reminder emails sent successfully.');
        } catch (error) {
            console.error('[Cron] Error in reminder job:', error);
        }
    });

    console.log('[Cron] Daily appointment reminder scheduler started (runs at 8:00 AM).');
};

export default startReminderCron;
