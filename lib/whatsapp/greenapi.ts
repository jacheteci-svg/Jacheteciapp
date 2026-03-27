export const sendWhatsAppMessage = async (chatId: string, message: string) => {
  const idInstance = process.env.GREENAPI_ID_INSTANCE;
  const apiToken = process.env.GREENAPI_API_TOKEN;

  if (!idInstance || !apiToken) {
    console.error("Green API credentials missing");
    return { success: false, error: "Credentials missing" };
  }

  const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: `${chatId}@c.us`,
        message: message,
      }),
    });

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return { success: false, error };
  }
};
