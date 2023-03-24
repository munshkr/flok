import { redirect } from "next/navigation";
import { generateRandomSessionName } from "@/lib/utils";

export default async function Page() {
  const sessionName = generateRandomSessionName();
  redirect(sessionName);
}
