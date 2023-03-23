import { GetServerSideProps } from "next";
import { generateRandomSessionName } from "@/lib/utils";

export const getServerSideProps: GetServerSideProps = async () => {
  const sessionName = generateRandomSessionName();
  return {
    redirect: {
      destination: `/s/${sessionName}`,
      permanent: false,
    },
  };
};

export default function Home() {}
