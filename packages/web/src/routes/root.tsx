import { redirect } from "react-router-dom";
import { generateRandomSessionName } from "@/lib/utils";

export async function loader() {
  const sessionName = generateRandomSessionName();
  const queryParams = window.location.search;
  const hashParams = window.location.hash;

  return redirect(`/s/${sessionName}${queryParams}${hashParams}`);
}
