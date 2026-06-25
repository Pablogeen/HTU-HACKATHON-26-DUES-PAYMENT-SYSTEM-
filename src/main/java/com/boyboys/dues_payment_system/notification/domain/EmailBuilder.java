package com.boyboys.dues_payment_system.notification.domain;

import org.springframework.stereotype.Component;

@Component
public class EmailBuilder {


    public String buildOtpEmailHtml(String firstname, String token) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8"/>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>COMPSSA — Your One Time Password</title>
                </head>
                <body style="margin:0; padding:40px 16px; background:#e8edf2; font-family:Arial, sans-serif;">

                <table width="100%%" cellpadding="0" cellspacing="0" border="0"
                       style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:4px; overflow:hidden; border:1px solid #cbd5e1;">

                  <!-- HEADER -->
                  <tr>
                    <td style="background:linear-gradient(135deg, #1a3a6b 0%%, #1e4d8c 60%%, #2563eb 100%%); padding:36px 40px; text-align:center;">
                      <span style="font-family:Georgia, serif; font-size:28px; font-weight:700; letter-spacing:5px; color:#ffffff; display:block;">
                        COMPSSA
                      </span>
                      <span style="font-family:Arial, sans-serif; font-size:12px; letter-spacing:2px; color:#93c5fd; text-transform:uppercase; display:block; margin-top:8px;">
                        Ho Technical University
                      </span>
                    </td>
                  </tr>

                  <!-- BLUE ACCENT BAR -->
                  <tr>
                    <td style="background:#2563eb; padding:6px 0;"></td>
                  </tr>

                  <!-- BODY -->
                  <tr>
                    <td style="padding:44px 40px 32px 40px; background:#ffffff;">

                      <!-- Greeting -->
                      <p style="margin:0 0 20px 0; font-size:20px; font-weight:700; color:#1e293b; font-family:Georgia, serif;">
                        Hello, %s,
                      </p>

                      <!-- Body text -->
                      <p style="margin:0 0 32px 0; font-size:15px; line-height:1.8; color:#475569;">
                        Use the One Time Password below to access the
                        <strong style="color:#1a3a6b;">COMPSSA Dues Payment System</strong>.
                        Enter this OTP on the login page to complete your sign-in.
                      </p>

                      <!-- OTP box -->
                      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
                        <tr>
                          <td style="background:linear-gradient(135deg, #1a3a6b 0%%, #2563eb 100%%); border-radius:4px; padding:18px 36px; text-align:center;">
                            <span style="font-family:Arial, sans-serif; font-size:32px; font-weight:700; letter-spacing:12px; color:#ffffff; display:block;">
                              %s
                            </span>
                          </td>
                        </tr>
                      </table>

                      <!-- Expiry notice -->
                      <p style="margin:0 0 20px 0; font-size:14px; line-height:1.7; color:#475569;">
                        This OTP will expire in <strong style="color:#1a3a6b;">5 minutes</strong> for security reasons.
                        Please do not share it with anyone.
                      </p>

                      <!-- Ignore notice -->
                      <p style="margin:0; font-size:14px; line-height:1.7; color:#475569;">
                        If you did not request access to the COMPSSA Dues Payment System,
                        you can safely ignore this email.
                      </p>

                    </td>
                  </tr>

                  <!-- DIVIDER -->
                  <tr>
                    <td style="padding:0 40px; background:#ffffff;">
                      <div style="height:1px; background:#e2e8f0;"></div>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background:#f8fafc; padding:24px 40px; text-align:center;">
                      <p style="margin:0 0 6px 0; font-size:12px; color:#94a3b8;">
                        &copy; 2026 <strong style="color:#1a3a6b;">COMPSSA</strong> — Ho Technical University. All rights reserved.
                      </p>
                      <p style="margin:0; font-size:11px; color:#cbd5e1; font-style:italic;">
                        This is an automated email. Please do not reply to this message.
                      </p>
                    </td>
                  </tr>

                </table>

                </body>
                </html>
                """.formatted(firstname, token);
    }

    public String buildPaymentSuccessEmailHtml(String firstName, String transactionReference) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8"/>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>COMPSSA — Payment Successful</title>
                </head>
                <body style="margin:0; padding:40px 16px; background:#e8edf2; font-family:Arial, sans-serif;">

                <table width="100%%" cellpadding="0" cellspacing="0" border="0"
                       style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:4px; overflow:hidden; border:1px solid #cbd5e1;">

                  <!-- HEADER -->
                  <tr>
                    <td style="background:linear-gradient(135deg, #1a3a6b 0%%, #1e4d8c 60%%, #2563eb 100%%); padding:36px 40px; text-align:center;">
                      <span style="font-family:Georgia, serif; font-size:28px; font-weight:700; letter-spacing:5px; color:#ffffff; display:block;">
                        COMPSSA
                      </span>
                      <span style="font-family:Arial, sans-serif; font-size:12px; letter-spacing:2px; color:#93c5fd; text-transform:uppercase; display:block; margin-top:8px;">
                        Ho Technical University
                      </span>
                    </td>
                  </tr>

                  <!-- BLUE ACCENT BAR -->
                  <tr>
                    <td style="background:#2563eb; padding:6px 0;"></td>
                  </tr>

                  <!-- BODY -->
                  <tr>
                    <td style="padding:44px 40px 32px 40px; background:#ffffff;">

                      <!-- Greeting -->
                      <p style="margin:0 0 20px 0; font-size:20px; font-weight:700; color:#1e293b; font-family:Georgia, serif;">
                        Hello, %s,
                      </p>

                      <!-- Thank you message -->
                      <p style="margin:0 0 20px 0; font-size:15px; line-height:1.8; color:#475569;">
                        Your department dues payment has been
                        <strong style="color:#1a3a6b;">successfully processed</strong>.
                        Thank you for fulfilling your financial obligation to
                        <strong style="color:#1a3a6b;">COMPSSA</strong> — your contribution helps support
                        the growth and activities of our department community.
                      </p>

                      <p style="margin:0 0 32px 0; font-size:15px; line-height:1.8; color:#475569;">
                        Please keep the transaction reference below as proof of your payment.
                        You may use it to verify or access your payment record at any time.
                      </p>

                      <!-- Divider -->
                      <div style="height:1px; background:#e2e8f0; margin:0 0 28px 0;"></div>

                      <!-- Reference label -->
                      <p style="margin:0 0 8px 0; font-size:11px; letter-spacing:2px; color:#94a3b8; text-transform:uppercase;">
                        Transaction Reference
                      </p>

                      <!-- Reference box -->
                      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
                        <tr>
                          <td style="background:linear-gradient(135deg, #1a3a6b 0%%, #2563eb 100%%); border-radius:4px; padding:18px 36px; text-align:center;">
                            <span style="font-family:Arial, sans-serif; font-size:22px; font-weight:700; letter-spacing:6px; color:#ffffff; display:block;">
                              %s
                            </span>
                          </td>
                        </tr>
                      </table>

                      <!-- Closing -->
                      <p style="margin:0; font-size:14px; line-height:1.7; color:#475569;">
                        If you did not make this payment or believe this was an error,
                        please contact the COMPSSA financial team immediately.
                      </p>

                    </td>
                  </tr>

                  <!-- DIVIDER -->
                  <tr>
                    <td style="padding:0 40px; background:#ffffff;">
                      <div style="height:1px; background:#e2e8f0;"></div>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background:#f8fafc; padding:24px 40px; text-align:center;">
                      <p style="margin:0 0 6px 0; font-size:12px; color:#94a3b8;">
                        &copy; 2026 <strong style="color:#1a3a6b;">COMPSSA</strong> — Ho Technical University. All rights reserved.
                      </p>
                      <p style="margin:0; font-size:11px; color:#cbd5e1; font-style:italic;">
                        This is an automated email. Please do not reply to this message.
                      </p>
                    </td>
                  </tr>

                </table>

                </body>
                </html>
                """.formatted(firstName, transactionReference);
    }

}