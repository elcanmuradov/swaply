package com.swaply.notificationservice.utils.constants;

import lombok.experimental.UtilityClass;

@UtilityClass
public class EmailContext {

    public static String setToken(String token){
        return String.format("""
            <!DOCTYPE html>
            <html lang="az">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Swaply - Email Təsdiqi</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
            
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #F0F0F0;
                        padding: 40px 20px;
                    }
            
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #FEFEFE;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    }
            
                    .header {
                        background-color: #113E21;
                        padding: 40px 30px;
                        text-align: center;
                    }
            
                    .logo {
                        font-size: 32px;
                        font-weight: 700;
                        color: #FEFEFE;
                        letter-spacing: 2px;
                    }
            
                    .logo span {
                        color: #B38B59;
                    }
            
                    .content {
                        padding: 50px 40px;
                    }
            
                    .greeting {
                        font-size: 24px;
                        color: #1A1A1A;
                        margin-bottom: 20px;
                        text-align: center;
                    }
            
                    .message {
                        font-size: 16px;
                        color: #666666;
                        line-height: 1.6;
                        text-align: center;
                        margin-bottom: 30px;
                    }
            
                    .verification-code {
                        background-color: #F0F0F0;
                        border: 2px dashed #113E21;
                        border-radius: 8px;
                        padding: 25px;
                        text-align: center;
                        margin: 30px 0;
                    }
            
                    .code {
                        font-size: 36px;
                        font-weight: 700;
                        color: #113E21;
                        letter-spacing: 8px;
                        font-family: 'Courier New', monospace;
                    }
            
                    .code-label {
                        font-size: 14px;
                        color: #666666;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
            
                    .btn {
                        display: inline-block;
                        background-color: #113E21;
                        color: #FEFEFE;
                        text-decoration: none;
                        padding: 16px 40px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        margin: 20px 0;
                        transition: background-color 0.3s;
                    }
            
                    .btn:hover {
                        background-color: #0d2f19;
                    }
            
                    .divider {
                        height: 1px;
                        background-color: #F0F0F0;
                        margin: 30px 0;
                    }
            
                    .footer {
                        background-color: #F0F0F0;
                        padding: 30px 40px;
                        text-align: center;
                    }
            
                    .footer-text {
                        font-size: 14px;
                        color: #666666;
                        line-height: 1.6;
                    }
            
                    .footer-text a {
                        color: #113E21;
                        text-decoration: none;
                    }
            
                    .expiry {
                        font-size: 13px;
                        color: #666666;
                        margin-top: 15px;
                        font-style: italic;
                    }
            
                    .social-links {
                        margin-top: 20px;
                    }
            
                    .social-links a {
                        display: inline-block;
                        margin: 0 10px;
                        color: #113E21;
                        text-decoration: none;
                        font-size: 14px;
                    }
            
                    @media only screen and (max-width: 600px) {
                        .content {
                            padding: 30px 20px;
                        }
            
                        .greeting {
                            font-size: 20px;
                        }
            
                        .code {
                            font-size: 28px;
                            letter-spacing: 5px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <!-- Header -->
                    <div class="header">
                        <div class="logo">Swap<span>ly</span></div>
                    </div>
            
                    <!-- Content -->
                    <div class="content">
                        <h1 class="greeting">Emailinizi Təsdiqləyin</h1>
            
                        <p class="message">
                            Salam! Swaply hesabınızı yaratdığınız üçün təşəkkür edirik.\s
                            Hesabınızı aktivləşdirmək üçün aşağıdakı təsdiq kodundan istifadə edin.
                        </p>
            
                        <!-- Verification Code -->
                        <div class="verification-code">
                            <div class="code-label">Təsdiq Kodu</div>
                            <div class="code">%s</div>
                            <div class="expiry">⏱ Kod 10 dəqiqə etibarlıdır</div>
                        </div>
            
                        <!-- Verify Button -->
                        <div style="text-align: center;">
                            <a href="{{VERIFICATION_LINK}}" class="btn">Emaili Təsdiqlə</a>
                        </div>
            
                        <div class="divider"></div>
            
                        <p class="message" style="font-size: 14px;">
                            Əgər bu düymə işləmirsə, aşağıdakı linki kopyalayıb brauzerinizə yapışdırın:
                            <br><br>
                            <strong style="color: #113E21; word-break: break-all;">{{VERIFICATION_LINK}}</strong>
                        </p>
                    </div>
            
                    <!-- Footer -->
                    <div class="footer">
                        <p class="footer-text">
                            Bu emaili <strong>Swaply</strong> komandası göndərdi.
                            <br>
                            Əgər bu qeydiyyatı siz etməmisinizsə, bu emaili nəzərə almayın.
                        </p>
            
                        <div class="social-links">
                            <a href="#">Website</a> |\s
                            <a href="#">Support</a> |\s
                            <a href="#">Privacy Policy</a>
                        </div>
            
                        <p class="footer-text" style="margin-top: 20px; font-size: 12px;">
                            © 2025 Swaply. Bütün hüquqlar qorunur.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """,token);
    }
}
