import { Inngest } from "inngest";
import User from "../models/User.js";
import sendEmail from "../configs/nodeMailer.js";
import Connection from "../models/Connection.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "pingup-app" });

const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-from-clerk' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    console.log(event.data);

    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    let username = email_addresses[0]?.email_address.split('@')[0];

    const user = await User.findOne({ username })
    if (user) {
      username = username + Math.floor(Math.random() * 10000)
    }

    const userData = {
      _id: id,
      email: email_addresses[0]?.email_address,
      full_name: `${first_name} ${last_name}`,
      username,
      profile_picture: image_url || "",
    }
    console.log(userData);


    await User.create(userData);
  }
)


const syncUserUpdate = inngest.createFunction(
  { id: 'update-user-from-clerk' },
  { event: 'clerk/user.updated' },
  async ({ event }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;

    const updateUserData = {
      email: email_address[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url || "",
    }
    await User.findByIdAndUpdate(id, updateUserData);

  }
)


const syncUserDeletion = inngest.createFunction(
  { id: 'delete-user-from-clerk' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    const { id } = event.data;

    await User.findByIdAndDelete(id);

  }
)


const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: 'send-new-connection-request-reminder' },
  { event: 'aap/connection-request' },
  async ({ event, step }) => {

    const { connectionId } = event.data;

    await step.run("send-connection-request-email", async () => {
      const connection = await Connection.findById(connectionId).populate('to-user-id');

      const subject = `New connection Request`;
      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}.</p>
        <p>Click <a href="${process.env.FRONTEND_URL}/connections"
        style="color: #10b981; text-decoration: none;">here</a> to accept or reject the request.</p>
        <br/>
        <p>Thanks,<br/>PingUp Social Team</p>
        </div>`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body
      })

      const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await step.sleepUntil("await-for-24-hours", in24Hours);
      await step.run("send-connection-request-reminder", async () => {
        const connection = await Connection.findById(connectionId).populate('from-user-id to-user-id');

        if (connection.status === 'accepted') {
          return { message: "Connection request already accepted." };
        }

        const subject = `New connection Request`;
        const body = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hi ${connection.to_user_id.full_name},</h2>
            <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}.</p>
            <p>Click <a href="${process.env.FRONTEND_URL}/connections"
            style="color: #10b981; text-decoration: none;">here</a> to accept or reject the request.</p>
            <br/>
            <p>Thanks,<br/>PingUp Social Team</p>
          </div>`;

        await sendEmail({
          to: connection.to_user_id.email,
          subject,
          body
        })
        return { message: "Connection request reminder sent." };
      });
    }
    );
  });



// Create an empty array where we'll export future Inngest functions
export const functions = [
  syncUserCreation,
  syncUserUpdate,
  syncUserDeletion,
  sendNewConnectionRequestReminder
];