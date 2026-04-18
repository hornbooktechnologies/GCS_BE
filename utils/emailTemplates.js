const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const generateLeaveRequestEmail = (
  userName,
  leaveType,
  duration,
  startDate,
  endDate,
  reason,
) => {
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  const formattedLeaveType = capitalize(leaveType);

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { background-color: #4A90E2; color: #ffffff; padding: 20px; text-align: center; }
    .header h2 { margin: 0; font-weight: 600; }
    .content { padding: 30px; }
    .info-item { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    .info-label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
    .info-value { color: #333; font-size: 16px; }
    .footer { background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
    .btn { display: inline-block; padding: 10px 20px; background-color: #4A90E2; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Leave Request</h2>
    </div>
    <div class="content">
      <p>Hello Admin/Manager,</p>
      <p>A new leave request has been submitted by <strong>${userName}</strong>.</p>
      
      <div style="background-color: #fbfbfb; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
        <div class="info-item">
          <span class="info-label">Leave Type</span>
          <span class="info-value" style="color: #4A90E2; font-weight: bold;">${formattedLeaveType}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Duration</span>
          <span class="info-value">${duration}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Date Range</span>
          <span class="info-value">${formattedStartDate} &nbsp; ➔ &nbsp; ${formattedEndDate}</span>
        </div>
        <div class="info-item" style="border-bottom: none;">
          <span class="info-label">Reason</span>
          <span class="info-value" style="font-style: italic;">"${reason}"</span>
        </div>
      </div>

      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || "#"}" class="btn" style="color: #ffffff;">Login to Dashboard</a>
      </p>
    </div>
    <div class="footer">
      <p>This is an automated message from GCS Hospital.</p>
    </div>
  </div>
</body>
</html>
  `;
};

const generateLeaveStatusUpdateEmail = (
  userName,
  leaveType,
  startDate,
  endDate,
  status,
  approverName = "Admin/Manager",
  adminRemark = null,
) => {
  const statusColor = status === "approved" ? "#2ecc71" : "#e74c3c";
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  const formattedLeaveType = capitalize(leaveType);

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { background-color: ${statusColor}; color: #ffffff; padding: 20px; text-align: center; }
    .header h2 { margin: 0; font-weight: 600; }
    .content { padding: 30px; }
    .info-item { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    .info-label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
    .info-value { color: #333; font-size: 16px; }
    .footer { background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
    .btn { display: inline-block; padding: 10px 20px; background-color: ${statusColor}; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Leave Request ${statusText}</h2>
    </div>
    <div class="content">
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Your leave request has been <strong>${statusText}</strong> based on the review by ${approverName}.</p>
      
      <div style="background-color: #fbfbfb; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
        <div class="info-item">
          <span class="info-label">Leave Type</span>
          <span class="info-value" style="font-weight: bold;">${formattedLeaveType}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Date Range</span>
          <span class="info-value">${formattedStartDate} &nbsp; ➔ &nbsp; ${formattedEndDate}</span>
        </div>
        <div class="info-item" style="border-bottom: none;">
          <span class="info-label">Status</span>
          <span class="info-value" style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
        </div>
        ${adminRemark
      ? `<div class="info-item" style="border-bottom: none; border-top: 1px solid #eee; margin-top: 10px; padding-top: 10px;">
          <span class="info-label">Admin Remark</span>
          <span class="info-value" style="font-style: italic;">"${adminRemark}"</span>
        </div>`
      : ""
    }
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from GCS Hospital.</p>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = {
  generateLeaveRequestEmail,
  generateLeaveStatusUpdateEmail,
  generateLeaveEditEmail: (
    userName,
    leaveType,
    duration,
    startDate,
    endDate,
    reason,
  ) => {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const formattedLeaveType = capitalize(leaveType);
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { background-color: #4A90E2; color: #ffffff; padding: 20px; text-align: center; }
    .header h2 { margin: 0; font-weight: 600; }
    .content { padding: 30px; }
    .info-item { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    .info-label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
    .info-value { color: #333; font-size: 16px; }
    .footer { background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
    .btn { display: inline-block; padding: 10px 20px; background-color: #4A90E2; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Updated Leave Request</h2>
    </div>
    <div class="content">
      <p>Hello Admin/Manager,</p>
      <p>A leave request has been updated by <strong>${userName}</strong>.</p>
      
      <div style="background-color: #fbfbfb; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
        <div class="info-item">
          <span class="info-label">Leave Type</span>
          <span class="info-value" style="color: #4A90E2; font-weight: bold;">${formattedLeaveType}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Duration</span>
          <span class="info-value">${duration}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Date Range</span>
          <span class="info-value">${formattedStartDate} &nbsp; ➔ &nbsp; ${formattedEndDate}</span>
        </div>
        <div class="info-item" style="border-bottom: none;">
          <span class="info-label">Reason</span>
          <span class="info-value" style="font-style: italic;">"${reason}"</span>
        </div>
      </div>

      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || "#"}" class="btn" style="color: #ffffff;">Login to Dashboard</a>
      </p>
    </div>
    <div class="footer">
      <p>This is an automated message from GCS Hospital.</p>
    </div>
  </div>
</body>
</html>
  `;
  },
};
