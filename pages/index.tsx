import { ThemeContext } from "@emotion/react";
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  Center,
  useMantineTheme,
} from "@mantine/core";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <Container size={420} my={40}>
      <div style={{ position: "relative", height: "50px" }}>
        <Image
          src="/logo_rmf.png"
          alt="Picture of the author"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <Title
        align="center"
        sx={(theme) => ({
          fontFamily: `Greycliff CF, ${theme.fontFamily}`,
          fontWeight: 900,
        })}
      >
        <Text
          component="span"
          inherit
          variant="gradient"
          gradient={{ from: "green", to: "red" }}
        >
          Reveal My Food
        </Text>
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput label="Email" placeholder="you@mantine.dev" required />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
        />
        <Group position="apart" mt="md">
          <Checkbox label="Remember me" />
          <Anchor<"a">
            onClick={(event) => event.preventDefault()}
            href="#"
            size="sm"
          >
            Forgot password?
          </Anchor>
        </Group>
        <Link href="restaurants">
          <Button fullWidth mt="xl" component="a">
            Sign in
          </Button>
        </Link>
      </Paper>
    </Container>
  );
};

export default Home;
