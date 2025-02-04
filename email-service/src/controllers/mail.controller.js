import { Slot } from "../models/slot.model.js";
import { User } from "../models/user.model.js";
import nodemailer from 'nodemailer';
import { tryCatch, Worker } from 'bullmq';
import dotenv from 'dotenv'

dotenv.config({
  path:'./.env'
})

const emailWorker = new Worker('booking-email-queue', async (job) => {
  const data = job.data
  console.log('Job Rec.. ', job.id)

  try {
    const slot = await Slot.findById(data.slotId);

    const user = await User.findById(slot.creator);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    })

    const mailConfigs = {
      from: process.env.EMAIL_USER,
      to: data.clientEmail,
      subject: `Regarding meeting scheduled on Timeslot with ${user.fullName}`,
      text: `Hello ${data.clientName}. This email is regarding your scheduled meeting with ${user.fullName}. The meeting is from ${slot.startTime} to ${slot.endTime} on ${slot.date}. The link to the meeting is: ${data.meetLink}.`
    }

    await transporter.sendMail(mailConfigs)
    console.log(`Email sent successfully for Job ID: ${job.id}`);
  } catch (error) {
    console.error(`Error in Job ID ${job.id}:`, error)
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

const cancelationEmailWorker = new Worker('cancelation-email-queue' , async (job)=>{
  const data  = job.data;
  console.log('Job received:', job?.id)

  try {
    const slot = await Slot.findById(data.slotId)

    const user = await User.findById(slot.creator)

    const transporter = nodemailer.createTransport({
      service:'gmail',
      auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    })

    const mailConfigs = {
      from: process.env.EMAIL_USER,
      to: data.customerEmail,
      subject: `Regarding meeting scheduled on Timeslot with ${user.fullName}`,
      text:`Hello ${data?.customerName},
      This email is regarding your scheduled meeting with ${user.fullName}. Unfortunately, the meeting has been canceled by ${user.fullName}. You can contact him via his Gmail or book another slot.`};

    await transporter.sendMail(mailConfigs)
    console.log(`Email sent successfully for Job ID: ${job?.id}`);
  } catch (error) {
    console.error(`Error in Job ID ${job?.id}:`, error);
  }
},{
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
})

const subemailWorker = new Worker("subtrack-email-queue", async(job)=>{
  const data = job.data
  console.log("Job" , data)
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    })

    const mailConfigs = {
      from: process.env.EMAIL_USER,
      to: "ns809203@gmail.com",
      subject: `Renewal of your ${data.service} subscription`,
      text: `Hello ${data.name}.`
    }

    await transporter.sendMail(mailConfigs)
    console.log(`Email sent successfully for Job ID: ${job.id}`);

  } catch (error) {
    console.error(`Error in Job ID ${job.id}:`, error)
  }

},{
  connection:{
    host:process.env.AIVEN_HOST,
    port:26644,
    username:process.env.AIVEN_USERNAME,
    password:process.env.AIVEN_PASSWORD ,
  },
  limiter: {
    max: 50,
    duration: 10 * 1000
  }
})

export {emailWorker , cancelationEmailWorker , subemailWorker}
