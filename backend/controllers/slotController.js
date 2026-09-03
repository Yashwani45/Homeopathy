const db = require("../database/dbConnectionManager");

// Helpers for time conversion
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3];
  if (ampm) {
    if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
  }
  return hours * 60 + minutes;
};

const formatMinutesToTime = (minutes) => {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${ampm}`;
};

/**
 * Calculates and returns list of available time slots for a doctor on a given date
 */
const getAvailableSlots = (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ error: "Missing doctorId or date" });
  }

  // 1. Fetch doctor details from active tenant DB
  db.query("SELECT availability FROM doctors WHERE id = ? AND deleted_at IS NULL", [doctorId], (err, result) => {
    if (err) {
      console.error("Error fetching doctor availability: ", err);
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    let availability = null;
    try {
      availability = result[0].availability ? JSON.parse(result[0].availability) : null;
    } catch (e) {
      console.error("Error parsing availability JSON: ", e);
    }

    // Default availability configuration if not set by doctor
    const config = availability || {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      slotDuration: 30,
      blockedDates: []
    };

    // Helper to normalize any date string or Date object to YYYY-MM-DD without timezone shifts
    const normalizeDateStr = (d) => {
      if (!d) return "";
      const str = String(d).trim();
      if (str.includes("T")) {
        return str.split("T")[0];
      }
      const yyyymmddMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (yyyymmddMatch) {
        return `${yyyymmddMatch[1]}-${yyyymmddMatch[2]}-${yyyymmddMatch[3]}`;
      }
      try {
        const parsed = new Date(str);
        if (!isNaN(parsed.getTime())) {
          const year = parsed.getFullYear();
          const month = String(parsed.getMonth() + 1).padStart(2, "0");
          const day = String(parsed.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        }
      } catch (e) {}
      return str;
    };

    // 2. Validate leaves from doctor_leaves table
    const checkDateStr = normalizeDateStr(date);
    db.query(
      "SELECT COUNT(*) as count FROM doctor_leaves WHERE doctor_id = ? AND ? BETWEEN start_date AND end_date AND deleted_at IS NULL",
      [doctorId, checkDateStr],
      (leaveErr, leaveResult) => {
        if (leaveErr) {
          console.error("Error checking doctor leaves: ", leaveErr);
          return res.status(500).json({ error: leaveErr.message });
        }

        const isOnLeave = leaveResult && leaveResult[0].count > 0;
        const isBlocked = isOnLeave || (config.blockedDates || []).some((bDate) => {
          return normalizeDateStr(bDate) === checkDateStr;
        });

        if (isBlocked) {
          return res.json([]); // Return empty list on blocked date or leave
        }

        // 3. Validate working day
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const bookingDate = (() => {
          const match = checkDateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (match) {
            return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
          }
          return new Date(date);
        })();
        const dayOfWeek = dayNames[bookingDate.getDay()]; // e.g. "Tuesday"

        const workDays = (config.days && config.days.length > 0)
          ? config.days
          : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        const isWorkingDay = workDays.some(
          (day) => day.toLowerCase() === dayOfWeek.toLowerCase()
        );

        if (!isWorkingDay) {
          return res.json([]); // Return empty list on non-working day
        }

        // 4. Generate all slots for shifts
        const generatedSlots = [];
        const duration = parseInt(config.slotDuration || 30);

        const hasMorning = config.morningStartTime && config.morningEndTime;
        const hasEvening = config.eveningStartTime && config.eveningEndTime;

        if (hasMorning || hasEvening) {
          if (hasMorning) {
            const morningStart = parseTimeToMinutes(config.morningStartTime);
            const morningEnd = parseTimeToMinutes(config.morningEndTime);
            for (let current = morningStart; current + duration <= morningEnd; current += duration) {
              generatedSlots.push(formatMinutesToTime(current));
            }
          }
          if (hasEvening) {
            const eveningStart = parseTimeToMinutes(config.eveningStartTime);
            const eveningEnd = parseTimeToMinutes(config.eveningEndTime);
            for (let current = eveningStart; current + duration <= eveningEnd; current += duration) {
              generatedSlots.push(formatMinutesToTime(current));
            }
          }
        } else {
          const startMins = parseTimeToMinutes(config.startTime || "10:00 AM");
          const endMins = parseTimeToMinutes(config.endTime || "01:00 PM");
          for (let current = startMins; current + duration <= endMins; current += duration) {
            generatedSlots.push(formatMinutesToTime(current));
          }
        }

        // 5. Query booked slots on this date (excluding Rejected or Soft Deleted status)
        db.query(
          "SELECT appointment_time FROM appointments WHERE doctor_id = ? AND date = ? AND status != 'Rejected' AND deleted_at IS NULL",
          [doctorId, date],
          (dbErr, bookingsResult) => {
            if (dbErr) {
              console.error("Error fetching doctor appointments: ", dbErr);
              return res.status(500).json({ error: dbErr.message });
            }

            const bookedSlots = bookingsResult.map((b) => b.appointment_time);
            
            // Filter out slots that are already booked
            const availableSlots = generatedSlots.filter((slot) => !bookedSlots.includes(slot));
            res.json(availableSlots);
          }
        );
      }
    );
  });
};

module.exports = {
  getAvailableSlots
};
