import { PropsWithChildren } from "react";
import Head from "next/head";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Head>
        <title>Flok</title>
        <meta
          name="description"
          content="Web-based P2P collaborative editor for live coding sounds and images"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{children}</main>
    </>
  );
}
