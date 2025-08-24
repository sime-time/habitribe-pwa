import { Hono, Context } from "hono";

const router = new Hono();

// YouForm webhook -> MailerLite API
router.post("/waitlist", async (c: Context) => {
  try {
    const mailerliteApiKey = c.env.MAILERLITE_API_KEY;
    const mailerliteGroupId = c.env.MAILERLITE_GROUP_ID;

    // Check if environment variables are set.
    if (!mailerliteApiKey || !mailerliteGroupId) {
      console.error("MailerLite API Key or Group ID is missing from environment variables.");
      return c.json({ error: "Server configuration error." }, 500);
    }

    // Parse the incoming JSON body from the YouForm webhook.
    const submission = await c.req.json();
    console.log("YouForm", submission);

    // YouForm sends a key value pair:
    // "question": "answer"
    const email = submission["What is your email?"];
    const name = submission["What is your name?"]
    const habits = submission["What habits are you trying to stay consistent with?"]
    const who = submission["Who would you want to stay accountable with?"]
    const clients = submission["If you're a coach or trainer, would you use Habitribe to keep your clients accountable?"]


    // If the email is not present, return an error.
    if (!email) {
      return c.json({ error: "Email address not found in the form submission." }, 400);
    }

    // Prepare the payload for the MailerLite API to create a new subscriber
    const subscriber = {
      email: email,
      fields: {
        name: name,
        habits: habits,
        accountablewith: who,
        usewithclients: clients,
      },
      groups: [
        mailerliteGroupId,
      ]
    };

    // Make the API call to MailerLite to add the new subscriber.
    const mailerliteResponse = await fetch(`https://connect.mailerlite.com/api/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${mailerliteApiKey}`,
      },
      body: JSON.stringify(subscriber),
    });

    // Check the response from MailerLite.
    if (mailerliteResponse.ok) {
      console.log(`Successfully added subscriber: ${email}`);
      return c.json({ message: "Subscriber added successfully." }, 200);
    } else {
      const errorText = await mailerliteResponse.text();
      console.error(`MailerLite API error: ${mailerliteResponse.status} - ${errorText}`);
      return c.json({ error: "Failed to add subscriber to MailerLite." }, 500);
    }

  } catch (error) {
    console.error("Webhook processing failed:", error);
    return c.json({ error: "An internal server error occurred." }, 500);
  }
});

export default router;
