import { PropsWithChildren } from "react";
import Head from "next/head";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Head>
        <title>flok</title>
        <meta
          name="description"
          content="Web-based P2P collaborative editor for live coding sounds and images"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-slate-900 text-slate-100 h-screen">{children}</main>
    </>
  );
}
