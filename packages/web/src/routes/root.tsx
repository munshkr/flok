import { redirect } from "react-router-dom";
import { generateRandomSessionName } from "../lib/utils";

export async function loader() {
  const sessionName = generateRandomSessionName();
  return redirect(`/s/${sessionName}`);
}
