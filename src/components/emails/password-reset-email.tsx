// components/emails/password-reset-email.tsx
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

interface PasswordResetEmailProps {
  resetCode: string;
}

export const PasswordResetEmail = ({ resetCode }: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Password reset request for Libra Institute</Preview>
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
          <Heading style={heading}>Password Reset Request</Heading>
        </Section>

        <Section style={content}>
          <Text style={paragraph}>Dear User,</Text>
          <Text style={paragraph}>
            We received a request to reset your password for the Libra Institute
            Application Portal. Please use the following verification code:
          </Text>

          <Section style={codeContainer}>
            <Text style={code}>{resetCode}</Text>
          </Section>

          <Text style={paragraph}>
            If you didn't request this password reset, please ignore this email
            or contact our IT support immediately at{" "}
            <Link href="mailto:support@librainstitute.edu" style={link}>
              support@librainstitute.edu
            </Link>
            .
          </Text>

          <Text style={paragraph}>
            For security reasons, this code will expire in 1 hour.
          </Text>

          <Text style={paragraph}>
            Best regards,
            <br />
            Libra Institute IT Support
          </Text>
        </Section>

        <Hr style={divider} />

        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} Libra Vocational & Business Institute
          </Text>
          <Section style={footerLinks}>
            <Link href="https://librainstitute.edu" style={footerLink}>
              Website
            </Link>
            <Text style={footerDivider}>•</Text>
            <Link href="mailto:support@librainstitute.edu" style={footerLink}>
              Support
            </Link>
          </Section>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Reuse the same styles from verification-email.tsx
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

const link = {
  color: "#E31937",
  textDecoration: "underline",
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
