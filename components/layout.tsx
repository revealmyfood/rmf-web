import React, { ReactNode } from "react";
import { Container, Grid } from "@mantine/core";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <Container my="md">
      <main>{children}</main>
    </Container>
  );
}
