import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SubmissionNotificationProps {
  formName: string;
  data: Record<string, string>;
  submittedAt: string;
  referer?: string;
}

export function SubmissionNotification({
  formName,
  data,
  submittedAt,
  referer,
}: SubmissionNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>New submission from {formName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Form Submission</Heading>
          <Text style={text}>Form: {formName}</Text>
          <Hr style={hr} />
          <Section>
            {Object.entries(data).map(([key, value]) => (
              <div key={key} style={row}>
                <Text style={label}>{key}</Text>
                <Text style={valueStyle}>{value}</Text>
              </div>
            ))}
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Submitted at {submittedAt}
            {referer ? ` from ${referer}` : ""}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = { margin: "0 auto", padding: "20px", maxWidth: "600px" };
const heading = { fontSize: "24px", fontWeight: "bold" as const, marginBottom: "16px" };
const text = { fontSize: "14px", color: "#333" };
const hr = { borderColor: "#e6ebf1", margin: "20px 0" };
const row = { marginBottom: "12px" };
const label = { fontSize: "12px", color: "#666", marginBottom: "2px" };
const valueStyle = { fontSize: "14px", color: "#333", marginTop: "0" };
const footer = { fontSize: "12px", color: "#999" };
