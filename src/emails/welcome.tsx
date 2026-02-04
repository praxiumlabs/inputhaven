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

interface WelcomeEmailProps {
  name: string;
  dashboardUrl: string;
}

export function WelcomeEmail({ name, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to InputHaven!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome, {name}!</Heading>
          <Text style={text}>
            You&apos;re all set to start collecting form submissions. Here&apos;s how to get started:
          </Text>
          <Text style={text}>1. Create a form in your dashboard</Text>
          <Text style={text}>2. Copy the access key</Text>
          <Text style={text}>3. Add it to your HTML form</Text>
          <Button style={button} href={dashboardUrl}>
            Go to Dashboard
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = { margin: "0 auto", padding: "40px 20px", maxWidth: "600px" };
const heading = { fontSize: "24px", fontWeight: "bold" as const };
const text = { fontSize: "14px", color: "#333", lineHeight: "1.6" };
const button = {
  backgroundColor: "#000",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block" as const,
  marginTop: "16px",
};
