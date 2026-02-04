import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  verifyUrl: string;
}

export function VerificationEmail({ verifyUrl }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your InputHaven email</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome to InputHaven!</Heading>
          <Text style={text}>Click the button below to verify your email address:</Text>
          <Button style={button} href={verifyUrl}>
            Verify Email
          </Button>
          <Text style={footer}>This link expires in 24 hours.</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = { margin: "0 auto", padding: "40px 20px", maxWidth: "600px" };
const heading = { fontSize: "24px", fontWeight: "bold" as const };
const text = { fontSize: "14px", color: "#333" };
const button = {
  backgroundColor: "#000",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block" as const,
  marginTop: "16px",
};
const footer = { fontSize: "12px", color: "#999", marginTop: "24px" };
