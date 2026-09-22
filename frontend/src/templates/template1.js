export const template1 = {
  id: 'yogo-cloud-intro',
  name: 'Yogo Cloud Intro',
  icon: '⚡',
  subject: 'Introducing Yogo Cloud – Smarter AWS Cloud Operations',
  html: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Introducing Yogo Cloud</title>
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<style>
  table, td { border-collapse: collapse; }
</style>
<![endif]-->
<style>
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: #ffffff; }
  a { color: #1d4ed8; }
  h1, h2, h3, p { font-family: Arial, Helvetica, sans-serif; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; }
  table { border-collapse: collapse; }
  td { box-sizing: border-box; }
  :root { color-scheme: light only; supported-color-schemes: light only; }

  /* Force the blue/white theme even when the recipient's mail app has dark mode on */
  @media (prefers-color-scheme: dark) {
    body, .email-container, .email-bg { background-color: #ffffff !important; }
    .force-white-bg { background-color: #ffffff !important; }
    .force-lightblue-bg { background-color: #eef3ff !important; }
    .force-navy-text { color: #0b1a3d !important; }
    .force-body-text { color: #5c6a8c !important; }
  }
  [data-ogsc] body, [data-ogsc] .email-container { background-color: #ffffff !important; }

  @media only screen and (max-width: 600px) {
    .email-container { width: 100% !important; }
    .fluid-padding { padding-left: 20px !important; padding-right: 20px !important; }
    .hero-padding { padding: 32px 24px !important; }
    .hero-heading { font-size: 24px !important; line-height: 32px !important; }
    .hero-sub { font-size: 14px !important; line-height: 21px !important; }
    .logo-row td { display: block !important; width: 100% !important; text-align: center !important; padding-bottom: 10px !important; }
    .logo-row img { max-width: 100px !important; margin-left: auto !important; margin-right: auto !important; }
    .logo-card-padding { padding: 20px 16px !important; }
    .cta-stack td { display: block !important; width: 100% !important; padding: 0 0 10px 0 !important; }
    .cta-stack a { text-align: center !important; }
    .heading-row td { display: block !important; width: 100% !important; text-align: left !important; }
    .heading-badge { padding-left: 0 !important; padding-top: 16px !important; text-align: left !important; }
    .feature-grid td { display: block !important; width: 100% !important; padding: 0 !important; }
    .feature-card { margin-bottom: 12px !important; }
    .feature-card td, .feature-card p { word-wrap: break-word !important; overflow-wrap: break-word !important; word-break: break-word !important; }
    .trust-row td { display: block !important; width: 100% !important; text-align: center !important; }
    .trust-row img { margin: 0 auto 14px auto !important; }
    .section-pad { padding-left: 24px !important; padding-right: 24px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#ffffff;" bgcolor="#ffffff">

<!-- Preheader (hidden preview text) -->
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; color:#ffffff; line-height:1px;">
  One platform for AWS cost, security, alerts, and operations, powered by VirtueCloud, an AWS Advanced Tier Services Partner.
</div>

<center style="width:100%; background-color:#ffffff;">
<div style="max-width:620px; margin:0 auto; background-color:#ffffff;" class="email-container">

  <!--[if mso]>
  <table role="presentation" cellpadding="0" cellspacing="0" width="620" align="center"><tr><td>
  <![endif]-->

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px; margin:0 auto;">

    <!-- Top spacer -->
    <tr><td style="height:28px; line-height:28px; font-size:0;">&nbsp;</td></tr>

    <!-- Logo lockup: VirtueCloud + Yogo Cloud -->
    <tr>
      <td class="fluid-padding" style="padding:0 30px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:14px; border:1px solid #dbe6ff;">
          <tr>
            <td style="padding:16px 24px;" class="logo-card-padding">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="logo-row">
                <tr>
                  <td width="50%" style="vertical-align:middle;">
                    <img src="https://yogo-email-templates-898896902478-prod.s3.ap-south-1.amazonaws.com/logopng.png" width="140" alt="Yogo Cloud" style="display:block; max-width:140px; height:auto;">
                  </td>
                  <td width="50%" align="right" style="vertical-align:middle;">
                    <img src="https://yogo-email-templates-898896902478-prod.s3.ap-south-1.amazonaws.com/vc-logo.png" width="122" alt="VirtueCloud" style="display:block; max-width:122px; height:auto; margin-left:auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr><td style="height:20px; line-height:20px; font-size:0;">&nbsp;</td></tr>

    <!-- ============ HERO CARD ============ -->
    <tr>
      <td class="fluid-padding" style="padding:0 30px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:20px; overflow:hidden; box-shadow:0 18px 40px rgba(11,26,61,0.22);">
          <tr>
            <td style="background-color:#0b1a3d; background-image:linear-gradient(135deg,#0b1a3d 0%,#122a63 45%,#1d4ed8 100%);">

              <!--[if mso]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:620px;">
              <v:fill type="gradient" color="#0b1a3d" color2="#1d4ed8" angle="135" />
              <v:textbox inset="0,0,0,0">
              <![endif]-->

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="hero-padding" style="padding:44px 44px 40px 44px;">

                    <!-- Eyebrow pill -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="background-color:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.28); border-radius:20px; padding:6px 14px;">
                          <span style="font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#ffffff;">Introducing Yogo Cloud</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Heading + AWS Partner logo -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="heading-row" style="margin-bottom:14px;">
                      <tr>
                        <td valign="middle">
                          <h1 class="hero-heading" style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:30px; line-height:38px; font-weight:800; color:#ffffff;">
                            Smarter AWS Cloud Operations, All in One Place
                          </h1>
                        </td>
                        <td width="112" valign="middle" align="right" class="heading-badge" style="padding-left:20px;">
                          <a href="https://partners.amazonaws.com/partners/001aq000008DJeZAAW" target="_blank">
                            <img src="https://d1.awsstatic.com/customer-references-case-studies-logos/1200x900_logos/AWS-Partner-Advanced_1200x900_Logo.65f93763f637c09cd04a0274db3ebb34fb2b349d.png" width="96" alt="AWS Advanced Tier Services Partner" style="display:block; width:96px; height:auto; border-radius:10px; background-color:#ffffff; padding:8px;">
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Sub copy -->
                    <p class="hero-sub" style="margin:0 0 28px 0; font-family:Arial, Helvetica, sans-serif; font-size:15.5px; line-height:24px; color:#c9d7ff;">
                      Yogo Cloud is VirtueCloud's AI-powered Cloud SRE intelligence platform, unifying cost, security, alerts, and workloads across every AWS account you run.
                    </p>

                    <!-- CTA buttons -->
                    <table role="presentation" cellpadding="0" cellspacing="0" class="cta-stack">
                      <tr>
                        <td style="border-radius:10px; background-color:#ffffff;">
                          <a href="https://yogo.virtuecloud.io/" target="_blank" style="display:inline-block; padding:14px 28px; font-family:Arial, Helvetica, sans-serif; font-size:14px; font-weight:700; color:#1d4ed8; text-decoration:none; border-radius:10px;">
                            Explore Yogo Cloud &rarr;
                          </a>
                        </td>
                        <td style="width:12px; line-height:12px; font-size:0;">&nbsp;</td>
                        <td style="border-radius:10px; border:1.5px solid rgba(255,255,255,0.55);">
                          <a href="https://yogo.virtuecloud.io/register" target="_blank" style="display:inline-block; padding:12.5px 26px; font-family:Arial, Helvetica, sans-serif; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:10px;">
                            Create Free Account
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!--[if mso]>
              </v:textbox>
              </v:rect>
              <![endif]-->

            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr><td style="height:24px; line-height:24px; font-size:0;">&nbsp;</td></tr>

    <!-- ============ MAIN WHITE CARD: pain point + features ============ -->
    <tr>
      <td class="fluid-padding" style="padding:0 30px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:20px; border:1px solid #dbe6ff; box-shadow:0 10px 26px rgba(29,78,216,0.08);">

          <!-- Pain point statement -->
          <tr>
            <td class="section-pad" style="padding:34px 40px 8px 40px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:16.5px; line-height:25px; font-weight:700; color:#0b1a3d; text-align:center;">
                No more scattered alerts, unclear AWS bills, or wasting time figuring out where to start when something breaks.
              </p>
            </td>
          </tr>

          <tr>
            <td class="section-pad" style="padding:22px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="height:1px; line-height:1px; font-size:0; background-color:#eef2f9;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Section title -->
          <tr>
            <td class="section-pad" style="padding:28px 40px 4px 40px;">
              <p style="margin:0 0 4px 0; font-family:Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#1d4ed8; text-align:center;">
                Everything, unified
              </p>
              <h2 style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:20px; line-height:28px; font-weight:800; color:#0b1a3d; text-align:center;">
                With Yogo Cloud, you can:
              </h2>
            </td>
          </tr>

          <!-- Feature grid: 2 columns x 3 rows -->
          <tr>
            <td class="section-pad" style="padding:22px 32px 8px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="feature-grid">
                <tr>
                  <td valign="top" style="width:50%; padding:0 8px 16px 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="feature-card" style="background-color:#f6f9ff; border:1px solid #e6edff; border-radius:14px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 4px 0; font-family:Arial, Helvetica, sans-serif; font-size:14.5px; font-weight:700; color:#0b1a3d;">AI Debugger</p>
                          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13.5px; line-height:19px; color:#5c6a8c;">Diagnose AWS issues fast, with root-cause context built in.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" style="width:50%; padding:0 8px 16px 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="feature-card" style="background-color:#f6f9ff; border:1px solid #e6edff; border-radius:14px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 4px 0; font-family:Arial, Helvetica, sans-serif; font-size:14.5px; font-weight:700; color:#0b1a3d;">Smart Alerts</p>
                          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13.5px; line-height:19px; color:#5c6a8c;">Cut through the noise and focus on what actually matters.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="width:50%; padding:0 8px 16px 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="feature-card" style="background-color:#f6f9ff; border:1px solid #e6edff; border-radius:14px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 4px 0; font-family:Arial, Helvetica, sans-serif; font-size:14.5px; font-weight:700; color:#0b1a3d;">Security &amp; Compliance</p>
                          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13.5px; line-height:19px; color:#5c6a8c;">Monitor CIS, PCI-DSS, HIPAA, SOC 2, and more.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" style="width:50%; padding:0 8px 16px 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="feature-card" style="background-color:#f6f9ff; border:1px solid #e6edff; border-radius:14px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 4px 0; font-family:Arial, Helvetica, sans-serif; font-size:14.5px; font-weight:700; color:#0b1a3d;">Multi-Account Visibility</p>
                          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13.5px; line-height:19px; color:#5c6a8c;">Manage your entire AWS environment from one dashboard.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="width:50%; padding:0 8px 0 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="feature-card" style="background-color:#f6f9ff; border:1px solid #e6edff; border-radius:14px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 4px 0; font-family:Arial, Helvetica, sans-serif; font-size:14.5px; font-weight:700; color:#0b1a3d;">Cost Optimization</p>
                          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13.5px; line-height:19px; color:#5c6a8c;">Track spend, anomalies, budgets, and savings opportunities.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" style="width:50%; padding:0 8px 0 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="feature-card" style="background-color:#eaf1ff; border:1px solid #cddcff; border-radius:14px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 4px 0; font-family:Arial, Helvetica, sans-serif; font-size:14.5px; font-weight:700; color:#0b1a3d;">Built for MSPs</p>
                          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13.5px; line-height:19px; color:#5c6a8c;">Manage multiple customer AWS environments at scale.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Mid-body CTA banner -->
          <tr>
            <td class="section-pad" style="padding:26px 40px 36px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1a3d; background-image:linear-gradient(120deg,#0b1a3d,#1d4ed8); border-radius:14px;">
                <tr>
                  <td style="padding:24px 26px; text-align:center;">
                    <p style="margin:0 0 4px 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; font-weight:700; color:#ffffff;">
                      See what's happening across your AWS environment, without jumping between tools.
                    </p>
                    <p style="margin:0 0 18px 0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:19px; color:#c9d7ff;">
                      Get a personalized walkthrough of Yogo Cloud with our team.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" align="center" class="cta-stack">
                      <tr>
                        <td style="border-radius:10px; background-color:#ffffff;">
                          <a href="https://yogo.virtuecloud.io/booking" target="_blank" style="display:inline-block; padding:12px 24px; font-family:Arial, Helvetica, sans-serif; font-size:13.5px; font-weight:700; color:#1d4ed8; text-decoration:none; border-radius:10px;">
                            Schedule a Call
                          </a>
                        </td>
                        <td style="width:10px; line-height:10px; font-size:0;">&nbsp;</td>
                        <td style="border-radius:10px; border:1.5px solid rgba(255,255,255,0.55);">
                          <a href="https://www.youtube.com/@VirtueCloud" target="_blank" style="display:inline-block; padding:10.5px 22px; font-family:Arial, Helvetica, sans-serif; font-size:13.5px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:10px;">
                            Watch our Videos
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>

    <tr><td style="height:20px; line-height:20px; font-size:0;">&nbsp;</td></tr>

    <!-- ============ TRUST STRIP ============ -->
    <tr>
      <td class="fluid-padding" style="padding:0 30px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; border:1px solid #dbe6ff;">
          <tr>
            <td style="padding:22px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="trust-row">
                <tr>
                  <td width="72" valign="middle" style="padding-right:18px;">
                    <a href="https://partners.amazonaws.com/partners/001aq000008DJeZAAW" target="_blank">
                      <img src="https://d1.awsstatic.com/customer-references-case-studies-logos/1200x900_logos/AWS-Partner-Advanced_1200x900_Logo.65f93763f637c09cd04a0274db3ebb34fb2b349d.png" width="64" alt="AWS Partner Advanced" style="display:block; width:64px; height:auto; border-radius:8px;">
                    </a>
                  </td>
                  <td valign="middle">
                    <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13.5px; line-height:21px; color:#5c6a8c;">
                      Built by <strong style="color:#0b1a3d;">VirtueCloud</strong>, an <a href="https://partners.amazonaws.com/partners/001aq000008DJeZAAW/Virtuecloud" target="_blank" style="color:#1d4ed8; font-weight:700; text-decoration:none;">AWS Advanced Tier Services Partner</a>, Yogo Cloud is designed based on our experience managing real-world AWS environments.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr><td style="height:28px; line-height:28px; font-size:0;">&nbsp;</td></tr>

    <!-- ============ FOOTER ============ -->
    <tr>
      <td class="fluid-padding" style="padding:0 30px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:0 0 12px 0;">
              <a href="https://virtuecloud.io" target="_blank" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#3d4966; text-decoration:none; font-weight:600;">virtuecloud.io</a>
              <span style="color:#9aabcf; padding:0 8px; font-family:Arial, sans-serif; font-size:13px;">&middot;</span>
              <a href="https://yogo.virtuecloud.io/" target="_blank" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#3d4966; text-decoration:none; font-weight:600;">yogo.virtuecloud.io</a>
              <br style="mso-hide:all;">
              <span style="display:inline-block; height:8px; line-height:8px; font-size:0;">&nbsp;</span><br>
              <a href="https://in.linkedin.com/company/virtuecloud" target="_blank" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#3d4966; text-decoration:none;">LinkedIn &ndash; VirtueCloud</a>
              <span style="color:#9aabcf; padding:0 8px; font-family:Arial, sans-serif; font-size:13px;">&middot;</span>
              <a href="https://www.linkedin.com/showcase/yogocloud/" target="_blank" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#3d4966; text-decoration:none;">LinkedIn &ndash; Yogo Cloud</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:14px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:18px; color:#8391b3;">
                You're receiving this because we thought Yogo Cloud might be relevant to your team.<br>
                &copy; 2026 VirtueCloud. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr><td style="height:40px; line-height:40px; font-size:0;">&nbsp;</td></tr>

  </table>

  <!--[if mso]>
  </td></tr></table>
  <![endif]-->

</div>
</center>

</body>
</html>`
};
