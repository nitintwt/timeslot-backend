import { Slot } from "../models/slot.model.js";
import { User } from "../models/user.model.js";
import nodemailer from 'nodemailer';
import { ApiError } from "../../../common/utils/ApiError.js";
import { Worker } from 'bullmq';
import dotenv from 'dotenv'

dotenv.config({
  path:'./.env'
})

const emailWorker = new Worker('email-queue', async (job) => {
  const data = job.data;
  console.log('Job Rec.. ', job.id);
  try {
    const slot = await Slot.findById(data.slotId);
    if (!slot) {
      throw new ApiError(404, 'Slot not found');
    }

    const user = await User.findById(slot.creator);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const mailConfigs = {
      from: process.env.EMAIL_USER,
      to: data.clientEmail,
      subject: "Testing",
      text: `Hello ${data.clientName}. This email is regarding your scheduled meeting with ${user.fullName}. The meeting is from ${slot.startTime} to ${slot.endTime} on ${slot.date}. The link to the meeting is: ${data.meetLink}.`
    };

    transporter.sendMail(mailConfigs, function (error, info) {
      if (error) {
        console.error('Error sending email:', error);
        throw new ApiError(500, 'Something went wrong while sending email', error);
      } else {
        console.log('Email sent successfully:', info);
      }
    });
  } catch (error) {
    console.error('Job failed:', error);
    throw new ApiError(404, error ,  'Something went wrong while seding mails');
  }
}, {
  connection: {
    host:process.env.AIVEN_HOST,
    port:process.env.AIVEN_PORT,
    username:process.env.AIVEN_USERNAME,
    password:process.env.AIVEN_PASSWORD ,
  },
  limiter: {
    max: 50,
    duration: 10 * 1000
  }
});

export default emailWorker;
