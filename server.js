const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const os = require("os");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const doctorTestimonialRoutes = require("./routes/doctorTestimonialRoutes");
const patientTestimonialRoutes = require("./routes/patientTestimonialRoutes");
const socialProfileRoutes = require("./routes/socialProfileRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const blogRoutes = require("./routes/blogRoutes");
const advertisementBannerRoutes = require("./routes/advertisementBannerRoutes");
const eventRoutes = require("./routes/eventRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const careerRoutes = require("./routes/careerRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const teamCategoryRoutes = require("./routes/teamCategoryRoutes");
const teamRoutes = require("./routes/teamRoutes");
const awardRoutes = require("./routes/awardRoutes");
const newsRoutes = require("./routes/newsRoutes");
const healthCampRoutes = require("./routes/healthCampRoutes");
const checkupPlanRoutes = require("./routes/checkupPlanRoutes");
const nodelOfficerRoutes = require("./routes/nodelOfficerRoutes");
const resultRoutes = require("./routes/resultRoutes");
const campusLifeRoutes = require("./routes/campusLifeRoutes");
const studentTestimonialRoutes = require("./routes/studentTestimonialRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const journalRoutes = require("./routes/journalRoutes");
const nursingPhotoGalleryRoutes = require("./routes/nursingPhotoGalleryRoutes");
const specialityRoutes = require("./routes/specialityRoutes");
const doctorRoutes = require("./routes/doctorRoutes");

const activityLogger = require("./middleware/activityLogger");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(activityLogger);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/doctor-testimonials", doctorTestimonialRoutes);
app.use("/api/patient-testimonials", patientTestimonialRoutes);
app.use("/api/social-profiles", socialProfileRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/advertisement-banner", advertisementBannerRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/newsletters", newsletterRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/team-categories", teamCategoryRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/awards", awardRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/health-camps", healthCampRoutes);
app.use("/api/checkup-plans", checkupPlanRoutes);
app.use("/api/nodel-officers", nodelOfficerRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/campus-life", campusLifeRoutes);
app.use("/api/student-testimonials", studentTestimonialRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/nursing-photo-gallery", nursingPhotoGalleryRoutes);
app.use("/api/specialities", specialityRoutes);
app.use("/api/doctors", doctorRoutes);

app.get("/", (req, res) => {
  res.send("GCS Hospital API is running");
});

const PORT = process.env.PORT || 5000;

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

app.listen(PORT, "0.0.0.0", () => {
  const localIP = getLocalIPAddress();
  console.log(`Server running on port ${PORT}`);
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://${localIP}:${PORT}`);
});
