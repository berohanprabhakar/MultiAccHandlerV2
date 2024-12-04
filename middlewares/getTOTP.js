
// Secret key provided by the API service

// Function to generate TOTP
const generateTOTP = async (secret) => {
  try {

    const {TOTP} = await import('totp-generator');
    const token = TOTP.generate(secret, {
        digits : 6,
        period:30,
    })

    console.log("Generated TOTP:", token.otp);
    return token.otp;

  } catch (error) {
    console.error("Error generating TOTP:", error.message);
  }
};

module.exports = {generateTOTP};