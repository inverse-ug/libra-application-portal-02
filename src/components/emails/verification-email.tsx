// components/emails/verification-email.tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link,
  Img,
} from "@react-email/components";

interface VerificationEmailProps {
  verificationCode: string;
}

export const VerificationEmail = ({
  verificationCode,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your verification code for Libra Institute</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://i.ibb.co/j9NwzW4L/cropped-libra-primary-whitebg.png"
            width="150"
            height="auto"
            alt="Libra Institute Logo"
            style={logo}
          />
          <Heading style={heading}>Email Verification</Heading>
        </Section>

        <Section style={content}>
          <Text style={paragraph}>Dear Applicant,</Text>
          <Text style={paragraph}>
            Thank you for applying to Libra Vocational & Business Institute.
            Please use the following verification code to complete your
            registration:
          </Text>

          <Section style={codeContainer}>
            <Text style={code}>{verificationCode}</Text>
          </Section>

          <Text style={paragraph}>
            This code will expire in 1 hour. If you didn't request this, please
            ignore this email or contact our admissions office.
          </Text>

          <Text style={paragraph}>
            Best regards,
            <br />
            The Libra Institute Team
          </Text>
        </Section>

        <Hr style={divider} />

        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} Libra Vocational & Business Institute.
            All rights reserved.
          </Text>
          <Section style={footerLinks}>
            <Link href="https://librainstitute.edu" style={footerLink}>
              Website
            </Link>
            <Text style={footerDivider}>•</Text>
            <Link
              href="mailto:admissions@librainstitute.edu"
              style={footerLink}>
              Admissions
            </Link>
            <Text style={footerDivider}>•</Text>
            <Link href="mailto:support@librainstitute.edu" style={footerLink}>
              Support
            </Link>
          </Section>
          <Text style={footerAddress}>P.O. Box 120466, Kampala</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "30px",
};

const logo = {
  margin: "0 auto",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#005F86",
  margin: "20px 0",
};

const content = {
  padding: "0 40px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333333",
  margin: "0 0 20px",
};

const codeContainer = {
  background: "#f5f5f5",
  borderRadius: "4px",
  margin: "25px 0",
  padding: "10px",
  textAlign: "center" as const,
};

const code = {
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "5px",
  color: "#E31937",
};

const divider = {
  borderColor: "#e5e5e5",
  margin: "30px 0",
};

const footer = {
  padding: "0 40px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#999999",
  margin: "0 0 10px",
};

const footerLinks = {
  margin: "10px 0",
};

const footerLink = {
  color: "#005F86",
  fontSize: "12px",
  textDecoration: "none",
  margin: "0 5px",
};

const footerDivider = {
  color: "#999999",
  fontSize: "12px",
  display: "inline-block",
  margin: "0 2px",
};

const footerAddress = {
  fontSize: "12px",
  color: "#999999",
  margin: "10px 0 0",
};
