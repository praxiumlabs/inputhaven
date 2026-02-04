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

interface PaymentFailedEmailProps {
  name: string;
  billingUrl: string;
}

export function PaymentFailedEmail({ name, billingUrl }: PaymentFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Payment failed - InputHaven</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Payment Failed</Heading>
          <Text style={text}>
            Hi {name}, we were unable to process your payment. Please update your billing information to continue using InputHaven.
          </Text>
          <Button style={button} href={billingUrl}>
            Update Billing
          </Button>
          <Text style={footer}>
            If you don&apos;t update your payment method, your account will be downgraded to the Free plan.
          </Text>
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
