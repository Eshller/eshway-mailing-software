export const emailTemplates = [
    {
        id: "product-launch",
        name: "Product Launch",
        subject: "Introducing Our Latest Product",
        content: `
        <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .email-container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              overflow: hidden;
          }
          .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
          }
          .content {
              padding: 20px;
              color: #333;
              line-height: 1.6;
          }
          .content h2 {
              font-size: 20px;
              color: #4CAF50;
          }
          .footer {
              background-color: #f4f4f4;
              color: #555;
              text-align: center;
              padding: 15px;
              font-size: 14px;
          }
          .button {
              display: inline-block;
              margin-top: 20px;
              padding: 10px 20px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-size: 16px;
          }
          .button:hover {
              background-color: #45a049;
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="header">
              Can We Listen to Your Story?
          </div>
          <div class="content">
              <p>Dear [Recipient Name],</p>
  
              <p>We hope you do not need our product. Here's a real story of someone who does.</p>
  
              <h2>Meet Sarah</h2>
              <p>Sarah opened her business, with dreams of building something she could be proud of. But soon, the challenges began to mount. She was working 16-hour days, juggling customer demands, managing finances she didn’t fully understand, and struggling to break even. Despite her tireless efforts, the bakery wasn’t profitable, and Sarah began to feel like a failure.</p>
  
              <p>This is the reality for many small businesses. Entrepreneurs face long hours, inefficient systems, and decisions based on outdated data. We believe these challenges don’t have to be the norm. To help businesses overcome these hurdles, we need to understand your struggles. What’s holding you back?</p>
  
              <p>Your insights, whether through a brief conversation or a quick survey, will directly help shape the solutions we’re working on. We’re committed to building something that genuinely addresses the pain points businesses like yours experience every day.</p>
  
              <p>Thank you for your time, and we look forward to connecting soon.</p>
  
              <p><strong>Best regards,</strong><br>
              Aditya Pratap Goswami<br>
              Product Manager<br>
              <a href="mailto:aditya@eshway.com">aditya@eshway.com</a><br>
              Eshway</p>
  
              <a href="https://example.com" class="button">Share Your Story</a>
          </div>
          <div class="footer">
              &copy; 2025 Eshway. All rights reserved.
          </div>
      </div>
  </body>
  </html>
  
      `,
    },
    {
        id: "promotional",
        name: "Special Offer",
        subject: "Exclusive Offer Just for You",
        content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h2>Dear [Recipient Name],</h2>
          <p>Don't miss out on our special offer, available only for you!</p>
          <div style="background-color: #ffeb3b; padding: 20px; border-radius: 8px; text-align: center;">
            <h3><strong>Special Offer: 30% OFF</strong></h3>
            <p>This offer is valid until [Date]. Don't wait!</p>
            <button style="background-color: #e91e63; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Get Your Discount</button>
          </div>
          <p>Best regards, <br /> The Eshway Team</p>
        </div>
      `,
    },
    {
        id: "product-launch-2",
        name: "Product Launch 2",
        subject: "Introducing Our Latest Product",
        content: `
        <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
              <td style="padding: 40px 30px;">
                  <h1 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px 0;">Can We Listen to Your Story?</h1>
                  
                  <p style="margin: 0 0 20px 0;">Dear [Recipient Name],</p>
                  
                  <p style="margin: 0 0 20px 0;">We hope you do not need our product. Here's a real story of someone who does.</p>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #d86dfc; margin: 20px 0;">
                      <p style="margin: 0 0 15px 0;">Sarah opened her business, with dreams of building something she could be proud of. But soon, the challenges began to mount. She was working 16-hour days, juggling customer demands, managing finances she didn't fully understand, and struggling to break even. Despite her tireless efforts, the bakery wasn't profitable, and Sarah began to feel like a failure.</p>
                  </div>
                  
                  <p style="margin: 0 0 20px 0;">This is the reality for many small businesses. Entrepreneurs face long hours, inefficient systems, and decisions based on outdated data. We believe these challenges don't have to be the norm.</p>
                  
                  <p style="margin: 0 0 20px 0;">To help businesses overcome these hurdles, we need to understand your struggles. What's holding you back? Your insights, whether through a brief conversation or a quick survey, will directly help shape the solutions we're working on, and we're committed to building something that genuinely addresses the pain points businesses like yours experience every day.</p>
                  
                  <p style="margin: 0 0 20px 0;">Thank you for your time, and we look forward to connecting soon.</p>
                  
                  <p style="margin: 0;">Best regards,</p>
                  <p style="margin: 5px 0; font-weight: bold;">Aditya Pratap Goswami</p>
                  <p style="margin: 0; color: #666666;">Product Manager</p>
                  <p style="margin: 5px 0;"><a href="mailto:aditya@eshway.com" style="color: #d86dfc; text-decoration: none;">aditya@eshway.com</a></p>
                  <p style="margin: 5px 0; font-weight: bold; color: #2c3e50;">Eshway</p>
              </td>
          </tr>
      </table>
  </body>
  </html>
      `,
    },
    {
        id: "product-launch-3",
        name: "Product Launch 3",
        subject: "Introducing Our Latest Product",
        content: `
        <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4;">
      <!-- Preview Text -->
      <div style="display: none; max-height: 0px; overflow: hidden;">
          Discover how successful businesses overcome their challenges - Read Sarah's inspiring journey...
      </div>
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <tr>
              <td style="background-color: #2c3e50; padding: 30px; text-align: center;">
                  <img src="https://eshway.com/black.png" width="50px" height="40px" alt="Eshway Logo" style="max-width: 120px;">
              </td>
          </tr>
          
          <!-- Hero Section -->
          <tr>
              <td style="padding: 40px 30px; background-color: #d86dfc; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 32px; margin: 0 0 20px 0; font-weight: 300;">Transform Your Business Journey</h1>
                  <p style="color: #ffffff; font-size: 18px; margin: 0;">Real Stories. Real Solutions. Real Results.</p>
              </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
              <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px;">Dear [Recipient Name],</p>
                  
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #666;">We hope you don't need our product. But if Sarah's story resonates with you, we might be able to help.</p>
                  
                  <!-- Story Box -->
                  <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #d86dfc;">
                  <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Christian&eyebrows=flatNatural,raisedExcited,raisedExcitedNatural,unibrowNatural,upDown,upDownNatural,default,defaultNatural&eyes=closed,default,eyeRoll,happy,side,squint,surprised,wink,winkWacky,xDizzy&mouth=default,grimace,smile,twinkle&skinColor=d08b5b,edb98a,f8d25c,fd9841,ffdbb4" width="50px" height="50px" alt="Quote" style="margin-bottom: 15px; border-radius: 50%; border: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 15px 0; font-style: italic; color: #555;">Sarah opened her business with dreams of building something she could be proud of. But soon, the challenges began to mount. She was working 16-hour days, juggling customer demands, managing finances she didn't fully understand, and struggling to break even. Despite her tireless efforts, the bakery wasn't profitable, and Sarah began to feel like a failure.</p>
                  </div>
                  
                  <p style="margin: 0 0 20px 0;">This is the reality for many small businesses. Entrepreneurs face:</p>
                      
                  <!-- Key Points -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                      <tr>
                          <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 10px;">
                              ⏰ Long, exhausting hours
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 10px;">
                              🔄 Inefficient systems
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
                              📊 Decisions based on outdated data
                          </td>
                      </tr>
                  </table>
                  
                  <!-- CTA Section -->
                  <div style="text-align: center; margin: 40px 0;">
                      <p style="margin: 0 0 20px 0; font-size: 18px; color: #2c3e50;">Share Your Story With Us</p>
                      <a href="#" style="display: inline-block; padding: 15px 30px; background-color: #d86dfc; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Schedule a Conversation</a>
                  </div>
                  
                  <!-- Signature -->
                  <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                      <p style="margin: 0;">Best regards,</p>
                      <p style="margin: 5px 0; font-weight: bold; color: #2c3e50;">Aditya Pratap Goswami</p>
                      <p style="margin: 0; color: #666666;">Product Manager</p>
                      <p style="margin: 5px 0;"><a href="mailto:aditya@eshway.com" style="color: #d86dfc; text-decoration: none;">aditya@eshway.com</a></p>
                      <img src="https://eshway.com/black.png" width="30px" height="30px" alt="Eshway" style="margin-top: 10px;">
                  </div>
              </td>
          </tr>
          
          <!-- Footer -->
          <tr>
              <td style="padding: 20px 30px; background-color: #f8f9fa; text-align: center;">
                  <p style="margin: 0; color: #666; font-size: 12px;">© 2025 Eshway. All rights reserved.</p>
                  <p style="margin: 10px 0 0 0; font-size: 12px;">
                      <a href="#" style="color: #666; text-decoration: none;">Unsubscribe</a> |
                      <a href="#" style="color: #666; text-decoration: none;">Privacy Policy</a>
                  </p>
              </td>
          </tr>
      </table>
  </body>
  </html>
      `,
    },
    {
        id: "product-launch-4",
        name: "Product Launch 4",
        subject: "Introducing Our Latest Product",
        content: `
        <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4;">
      <!-- Preview Text -->
      <div style="display: none; max-height: 0px; overflow: hidden;">
          Stop struggling with your business operations - Learn how Sarah transformed her bakery...
      </div>
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header with Gradient -->
          <tr>
              <td style="background: linear-gradient(135deg, #2563EB 0%, #d86dfc 100%); padding: 40px 30px; text-align: center;">
                  <img src="https://eshway.com/black.png" width="50px" height="40px" alt="Eshway Logo" style="max-width: 120px; margin-bottom: 30px;">
                  <h1 style="color: #ffffff; font-size: 36px; margin: 0 0 15px 0; font-weight: 700;">Your Business Deserves Better</h1>
                  <p style="color: #ffffff; font-size: 18px; margin: 0; opacity: 0.9;">We're Here to Help You Succeed</p>
              </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
              <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px;">Dear [Recipient Name],</p>
                  
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #4B5563;">Every business owner starts with a dream. But sometimes, that dream feels more like a daily struggle.</p>
                  
                  <!-- Featured Story -->
                  <div style="background-color: #F3F4F6; padding: 30px; border-radius: 12px; margin: 30px 0; position: relative;">
                      <div style="position: absolute; top: -15px; left: 30px; background-color: #d86dfc; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">Sarah's Story</div>
                      <p style="margin: 10px 0 15px 0; font-style: italic; color: #4B5563; font-size: 16px;">Sarah opened her business with dreams of building something she could be proud of. But soon, the challenges began to mount. She was working 16-hour days, juggling customer demands, managing finances she didn't fully understand, and struggling to break even. Despite her tireless efforts, the bakery wasn't profitable, and Sarah began to feel like a failure.</p>
                  </div>
                  
                  <!-- Pain Points Grid -->
                  <div style="margin: 30px 0;">
                      <p style="text-align: center; font-size: 20px; color: #1F2937; margin-bottom: 20px;">Sound Familiar? You're Not Alone.</p>
                      <table role="presentation" width="100%" cellspacing="10" cellpadding="0">
                          <tr>
                              <td width="50%" style="padding: 20px; background-color: #F3F4F6; border-radius: 8px; text-align: center;">
                                  <p style="margin: 0; font-weight: bold; color: #d86dfc;">16+ Hours</p>
                                  <p style="margin: 5px 0 0 0; font-size: 14px;">Daily Grind</p>
                              </td>
                              <td width="50%" style="padding: 20px; background-color: #F3F4F6; border-radius: 8px; text-align: center;">
                                  <p style="margin: 0; font-weight: bold; color: #d86dfc;">Manual Tasks</p>
                                  <p style="margin: 5px 0 0 0; font-size: 14px;">Eating Your Time</p>
                              </td>
                          </tr>
                          <tr>
                              <td width="50%" style="padding: 20px; background-color: #F3F4F6; border-radius: 8px; text-align: center;">
                                  <p style="margin: 0; font-weight: bold; color: #d86dfc;">Outdated Data</p>
                                  <p style="margin: 5px 0 0 0; font-size: 14px;">Clouding Decisions</p>
                              </td>
                              <td width="50%" style="padding: 20px; background-color: #F3F4F6; border-radius: 8px; text-align: center;">
                                  <p style="margin: 0; font-weight: bold; color: #d86dfc;">Financial Stress</p>
                                  <p style="margin: 5px 0 0 0; font-size: 14px;">Limiting Growth</p>
                              </td>
                          </tr>
                      </table>
                  </div>
                  
                  <!-- Call to Action -->
                  <div style="text-align: center; background: linear-gradient(135deg, #6366F1 0%, #d86dfc 100%); padding: 40px; border-radius: 12px; margin: 30px 0;">
                      <h2 style="color: #ffffff; margin: 0 0 15px 0; font-size: 24px;">Ready to Write Your Success Story?</h2>
                      <p style="color: #ffffff; margin: 0 0 25px 0; opacity: 0.9;">Share your challenges with us, and let's build solutions together.</p>
                      <a href="#" style="display: inline-block; padding: 15px 30px; background-color: #ffffff; color: #d86dfc; text-decoration: none; border-radius: 25px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Book Your Session</a>
                  </div>
                  
                  <!-- Signature -->
                  <div style="margin-top: 40px;">
                      <p style="margin: 0;">Best regards,</p>
                      <p style="margin: 5px 0; font-weight: bold; color: #1F2937;">Aditya Pratap Goswami</p>
                      <p style="margin: 0; color: #6B7280;">Product Manager</p>
                      <p style="margin: 5px 0;"><a href="mailto:aditya@eshway.com" style="color: #d86dfc; text-decoration: none;">aditya@eshway.com</a></p>
                      <img src="https://eshway.com/black.png" width="30px" height="30px" alt="Eshway" style="margin-top: 10px;">
                  </div>
              </td>
          </tr>
          
          <!-- Footer -->
          <tr>
              <td style="padding: 20px 30px; background-color: #F3F4F6; text-align: center;">
                  <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 12px;">© 2025 Eshway. All rights reserved.</p>
                  <p style="margin: 0; font-size: 12px;">
                      <a href="#" style="color: #6B7280; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
                      <a href="#" style="color: #6B7280; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
                      <a href="#" style="color: #6B7280; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                  </p>
              </td>
          </tr>
      </table>
  </body>
  </html>
      `,
    },
    {
        id: "product-launch-5",
        name: "Product Launch 5",
        subject: "Introducing Our Latest Product",
        content: `
        <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Can We Listen to Your Story?</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #12192a;
        color: #ffffff;
        line-height: 1.6;
      }

      .container {
        padding: 20px;
        max-width: 900px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 30px;
      }

      .logo {
        max-width: 100px;
      }

      .header-title {
        flex: 1;
        text-align: center;
      }

      .header h1 {
        color: #ffffff;
        font-size: 2em;
      }

      .header h2 {
        color: #ff4d4d;
        font-size: 1.2em;
        margin-top: -10px;
      }

      .story-section {
        margin-bottom: 30px;
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }

      .story-text {
        flex: 1;
        min-width: 300px;
      }

      .story-text p {
        margin: 10px 0;
      }

      .story-image {
        flex: 1;
        min-width: 300px;
        text-align: center;
      }

      .story-image img {
        max-width: 100%;
        border-radius: 10px;
      }

      .highlight {
        color: #ff9dfd;
        font-size: 1.2em;
        margin-top: 20px;
      }

      .footer {
        background-color: #1c2541;
        padding: 20px;
        border-radius: 10px;
      }

      .footer h3 {
        margin-bottom: 10px;
        color: #ff9dfd;
      }

      .footer ul {
        list-style: none;
        padding: 0;
      }

      .footer ul li {
        margin: 10px 0;
      }

      .footer ul li::before {
        content: "2022";
        color: #ff9dfd;
        font-weight: bold;
        display: inline-block;
        width: 20px;
      }

      .footer p {
        margin-top: 20px;
        font-size: 1.1em;
      }

      .footer p span {
        color: #ff9dfd;
      }

      .Powered {
        align-items: flex-start;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          "
        >
          <img src="logo.png" alt="Eshway Logo" class="logo" />
          <span
            style="
              font-weight: light;
              color: #d1d5db;
              line-height: 1.3;
              font-size: 0.7rem;
            "
            >Powered by <br /><span
              style="font-weight: bold; font-size: 1.7rem; color: white"
              >Eshway</span
            ></span
          >
        </div>
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          "
        >
          <span style="font-weight: bold; font-size: 1.7rem; color: white"
            >LTD</span
          >
          <img src="ltd-removebg-preview.png" alt="LTD Logo" class="logo" />
        </div>
      </div>
      <div class="header-title">
        <h1>
          Can We Listen to <span style="color: #ff9dfd">Your Story?</span>
        </h1>
        <h3 style="color: #ff4d4d">
          We hope you do not need our product. <br />
        </h3>
        <h2>But here's a real story of someone who does.</h2>
      </div>

      <div class="story-section">
        <div class="story-text">
          <p>
            Sarah, after quitting her job, opened a B2C business, with dreams of
            building something she could be proud of.
          </p>
          <p>
            But soon, the challenges piled up. She was working 16-hour days,
            juggling customer demands, managing finances she didn’t fully
            understand, and struggling to break even.
          </p>
          <p>
            Despite her tireless efforts, the business wasn’t profitable, and
            Sarah began to feel like a failure.
          </p>
        </div>
        <div class="story-image">
          <img src="lady.jpg" alt="Sarah's struggles" />
        </div>
      </div>

      <div class="highlight">
        <p>This is the reality for many small businesses.</p>
      </div>

      <div class="story-section">
        <div class="story-text">
          <p>
            Entrepreneurs face long hours, inefficient systems, and decisions
            based on outdated data. We believe these challenges don’t have to be
            the norm. To help businesses overcome these hurdles, we need to
            understand your struggles. What’s holding you back?
          </p>
          <p>
            Your insights, whether through a brief conversation or an in-depth
            analysis, will directly help shape the solutions we’re working on,
            and we’re committed to building something that genuinely addresses
            the pain points businesses like experience every day.
          </p>
        </div>
      </div>

      <div class="footer">
        <h3>What's In It For You?</h3>
        <ul>
          <li>
            <strong>Personalized Solutions:</strong> Insights to help you
            address your current business challenges.
          </li>
          <li>
            <strong>Better Efficiency:</strong> Leverage data-driven
            decision-making for better results.
          </li>
          <li>
            <strong>Competitive Edge:</strong> Access the latest strategies and
            tools designed to keep your business ahead of the curve.
          </li>
        </ul>
      </div>
      <p>
        Thank you for your time,
        <span style="color: #ff9dfd"
          >and we look forward to connecting soon.</span
        >
      </p>
    </div>
  </body>
</html>
        `,
    },
    // Add more templates as needed
];