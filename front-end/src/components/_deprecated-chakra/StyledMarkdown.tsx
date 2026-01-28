import { Box } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";

export default function StyledMarkdown({ children }: { children: string }) {
  return (
    <Box
      sx={{
        h1: {
          fontSize: "2xl",
          fontWeight: "bold",
          mb: 4,
          mt: 4,
        },
        h2: {
          fontSize: "xl",
          fontWeight: "bold",
          mb: 3,
          mt: 5,
        },
        p: {
          mb: 4,
        },
        "ul, ol": {
          pl: 6,
          mb: 4,
        },
        li: {
          ml: 4,
          mb: 2,
        },
        a: {
          color: "blue.500",
          textDecoration: "underline",
        },
      }}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </Box>
  );
}
